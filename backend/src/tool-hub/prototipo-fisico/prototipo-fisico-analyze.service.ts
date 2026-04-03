import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { PrototipoFisicoAnalyzeReqDto } from './dto/prototipo-fisico-analyze.req.dto';
import { PrototipoFisicoAnalyzeResDto, PrototipoFisicoReportDto } from './dto/prototipo-fisico-analyze.res.dto';
import { buildProjectContextSection, ProjectBriefContext } from '../shared/project-context';

const MATERIAL_LABELS: Record<string, string> = {
  carton: 'Cartón (costo muy bajo)',
  foam: 'Foam (costo bajo)',
  'madera-balsa': 'Madera balsa (costo bajo)',
  'impresion-3d': 'Impresión 3D (costo medio)',
  resina: 'Resina (costo alto)',
  otro: 'Otro material',
};

const NIVEL_LABELS: Record<string, string> = {
  'mockup-papel': 'Mockup de papel (forma básica, cartón)',
  'modelo-funcional': 'Modelo funcional (partes móviles)',
  'prototipo-usuario': 'Prototipo de usuario (near production)',
  produccion: 'Producción (lo que se va a fabricar)',
};

const RESULTADO_LABELS: Record<string, string> = {
  exitoso: 'Exitoso',
  'con-ajustes': 'Con ajustes necesarios',
  fallido: 'Fallido',
};

@Injectable()
export class PrototipoFisicoAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(dto: PrototipoFisicoAnalyzeReqDto): Promise<PrototipoFisicoAnalyzeResDto> {
    const { tool, project } = await this.loadContext(dto.toolApplicationId);
    const systemPrompt = this.buildSystemPrompt(tool, project);
    const dataText = this.formatData(dto);

    const raw = await this.aiService.chat(
      [{ role: 'user', content: `${dataText}\n\nGenerá el análisis en JSON ahora.` }],
      systemPrompt,
      2048,
    );

    let report: PrototipoFisicoReportDto;
    try {
      report = JSON.parse(this.extractJson(raw)) as PrototipoFisicoReportDto;
    } catch {
      console.error('[PrototipoFisicoAnalyzeService] Raw AI response:', raw);
      throw new UnprocessableEntityException('La respuesta del AI no es JSON válido');
    }

    return {
      version: dto.currentVersion + 1,
      generatedAt: new Date().toISOString(),
      report,
    };
  }

  private buildSystemPrompt(
    tool: { nombre: string; descripcion: string; comoSeUsa: string | null },
    project: ProjectBriefContext,
  ): string {
    const projectSection = buildProjectContextSection(project);

    return `Sos un experto en prototipado físico, diseño industrial y metodologías de fabricación iterativa. Tu especialidad es analizar ciclos de prototipado con materiales físicos: evaluar si la progresión de fidelidad fue la adecuada (¿se usó el material más barato posible para la pregunta que se quería responder?), identificar hallazgos ergonómicos críticos, distinguir los problemas que se detectaron de las mejoras que ya quedaron validadas, y evaluar qué riesgos quedan pendientes antes de ir a producción. Tenés visión de costos — sabés que $200 en cartón y foam pueden evitar $50,000 en moldes.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá el ciclo de prototipado físico documentado y generá un análisis de calidad en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 2-3 oraciones: qué producto se prototipó, cuántas iteraciones hubo, qué material range se cubrió (del más básico al más fiel), y cuál fue el resultado global.",
  "evaluacionProgresion": "Análisis de si el equipo escaló bien la fidelidad: ¿arrancaron con el material más barato posible para la pregunta que tenían? ¿Cada iteración fue necesaria o se saltaron pasos? ¿La inversión en materiales fue proporcional a los aprendizajes obtenidos? ¿Cuándo se tomó la decisión de subir fidelidad fue en el momento correcto?",
  "hallazgosErgonomicos": [
    "Hallazgo físico concreto — puede ser sobre forma, peso, textura, grip, tamaño, ángulo, operabilidad",
    "Segundo hallazgo ergonómico — puede emerger de múltiples iteraciones o de una sola sesión de testing",
    "Más hallazgos si los hay"
  ],
  "problemasDetectados": [
    "Problema específico detectado en las iteraciones de testing — puede ser de usabilidad física, de diseño estructural, o de experiencia de usuario",
    "Segundo problema — puede ser de una iteración específica o emergente entre varias",
    "Más problemas si los hay"
  ],
  "mejorasValidadas": [
    "Aspecto del diseño que quedó validado positivamente — algo que el prototipo confirmó que funciona bien",
    "Segunda mejora validada — puede ser sobre forma, mecanismo, material o experiencia",
    "Más validaciones si las hay — si no hay, array vacío []"
  ],
  "riesgosParaProduccion": [
    "Riesgo o incógnita que NO se pudo responder con los prototipos actuales y que podría ser crítico en producción — puede ser sobre durabilidad, escalabilidad de fabricación, costo real de materiales de producción, o comportamiento con usuarios reales en contexto",
    "Segundo riesgo — puede ser sobre compatibilidad con regulaciones, comportamiento bajo stress, o variabilidad entre unidades",
    "Si no hay riesgos evidentes, array vacío []"
  ],
  "recommendations": [
    "Qué hacer antes de ir a producción o al siguiente nivel de fidelidad — basado en los problemas detectados más críticos",
    "Qué aspecto del diseño tiene mayor potencial de riesgo en producción y cómo mitigarlo antes de fabricar el molde",
    "Cómo estructurar el próximo ciclo de testing para cerrar las incógnitas restantes"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- Si hay pocas iteraciones (1-2), evaluá si fue suficiente para las preguntas que se querían responder.
- mejorasValidadas puede ser array vacío [] si no hay validaciones claras.
- riesgosParaProduccion puede ser array vacío [] si el prototipo es muy básico y no hay decisión de avanzar.
- Mínimo 2 hallazgosErgonomicos, 1 problemaDetectado, 3 recommendations.`;
  }

  private formatData(dto: PrototipoFisicoAnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== PROTOTIPO FÍSICO ==='];

    if (data.objetivo) lines.push(`\nOBJETIVO / QUÉ SE QUERÍA VALIDAR:\n"${data.objetivo}"`);
    if (data.productoDescripcion) lines.push(`\nPRODUCTO A PROTOTIPAR:\n"${data.productoDescripcion}"`);

    if (data.iteraciones?.length) {
      lines.push(`\nITERACIONES (${data.iteraciones.length} total):`);
      data.iteraciones.forEach((iter, i) => {
        lines.push(`\n--- Iteración ${i + 1} ---`);
        if (iter.material) {
          const matLabel = iter.material === 'otro' && iter.materialOtro
            ? iter.materialOtro
            : (MATERIAL_LABELS[iter.material] ?? iter.material);
          lines.push(`Material: ${matLabel}`);
        }
        if (iter.nivel) lines.push(`Nivel de fidelidad: ${NIVEL_LABELS[iter.nivel] ?? iter.nivel}`);
        if (iter.tiempoFabricacion) lines.push(`Tiempo de fabricación: ${iter.tiempoFabricacion}`);
        if (iter.descripcion) lines.push(`Descripción: "${iter.descripcion}"`);
        if (iter.testRealizado) lines.push(`Test realizado: "${iter.testRealizado}"`);
        if (iter.resultado) lines.push(`Resultado: ${RESULTADO_LABELS[iter.resultado] ?? iter.resultado}`);
        if (iter.hallazgos?.length) {
          lines.push(`Hallazgos:`);
          iter.hallazgos.forEach(h => { if (h) lines.push(`  • ${h}`); });
        }
      });
    }

    if (data.hallazgosGlobales?.length) {
      lines.push(`\nHALLAZGOS GLOBALES DEL PROCESO:`);
      data.hallazgosGlobales.forEach(h => { if (h) lines.push(`  • ${h}`); });
    }

    if (data.costoTotal) lines.push(`\nCOSTO TOTAL EN MATERIALES: ${data.costoTotal}`);
    if (data.decisionFinal) lines.push(`\nDECISIÓN FINAL:\n"${data.decisionFinal}"`);

    return lines.join('\n');
  }

  private extractJson(raw: string): string {
    const trimmed = raw.trim();
    const codeBlock = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlock) return codeBlock[1].trim();
    const jsonObject = trimmed.match(/(\{[\s\S]*\})/);
    if (jsonObject) return jsonObject[1].trim();
    return trimmed;
  }

  private async loadContext(toolApplicationId: number) {
    const app = await this.prisma.toolApplication.findUnique({
      where: { id: toolApplicationId },
      include: { tool: true, projectPhase: { include: { project: true } } },
    });
    if (!app) throw new NotFoundException('Tool application no encontrada');
    return { tool: app.tool, project: app.projectPhase.project };
  }
}
