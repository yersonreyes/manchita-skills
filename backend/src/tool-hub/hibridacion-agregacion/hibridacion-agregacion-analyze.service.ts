import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { HibridacionAgregacionAnalyzeReqDto } from './dto/hibridacion-agregacion-analyze.req.dto';
import { HibridacionAgregacionAnalyzeResDto, HibridacionAgregacionReportDto } from './dto/hibridacion-agregacion-analyze.res.dto';
import { buildProjectContextSection, ProjectBriefContext } from '../shared/project-context';

const TECNICA_LABELS: Record<string, string> = {
  'feature-stacking': 'Feature Stacking (sumar features)',
  'best-of-each': 'Best of Each (lo mejor de cada idea)',
  'plus-minus': 'Plus/Minus (agregar y quitar)',
  'mashup': 'Mashup (combinar productos/servicios)',
};

@Injectable()
export class HibridacionAgregacionAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(dto: HibridacionAgregacionAnalyzeReqDto): Promise<HibridacionAgregacionAnalyzeResDto> {
    const { tool, project } = await this.loadContext(dto.toolApplicationId);
    const systemPrompt = this.buildSystemPrompt(tool, project);
    const dataText = this.formatData(dto);

    const raw = await this.aiService.chat(
      [{ role: 'user', content: `${dataText}\n\nGenerá el análisis en JSON ahora.` }],
      systemPrompt,
      2048,
    );

    let report: HibridacionAgregacionReportDto;
    try {
      report = JSON.parse(this.extractJson(raw)) as HibridacionAgregacionReportDto;
    } catch {
      console.error('[HibridacionAgregacionAnalyzeService] Raw AI response:', raw);
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

    return `Sos un experto en innovación, Design Thinking y estrategia de producto. Tu especialidad es analizar procesos de hibridación de ideas: evaluar qué tan coherente y potente es la combinación de elementos entre ideas distintas, detectar las sinergias reales que emergen, identificar los riesgos de integración y ampliar la propuesta de valor de la idea híbrida resultante.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá el proceso de hibridación por agregación documentado y generá un análisis estratégico en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 2-3 oraciones: qué ideas base se combinaron, qué elementos clave se agregaron, qué es la idea híbrida resultante y cuál es su principal fortaleza.",
  "evaluacionHibrida": "Evaluación cualitativa de la idea híbrida: ¿la combinación es coherente y natural, o es forzada? ¿los elementos se complementan o generan fricción? ¿la suma es mayor que las partes? ¿cuánta complejidad agrega versus cuánto valor?",
  "elementosClave": [
    "Elemento específico que hace que la combinación funcione — no un feature genérico sino el componente crítico",
    "Segundo elemento clave",
    "Tercer elemento si aplica"
  ],
  "sinergiasDetectadas": [
    {
      "combinacion": "Descripción breve de qué elementos se combinan (ej: 'Suscripción mensual + delivery recurrente')",
      "sinergia": "Qué sinergia real emerge: qué valor nuevo se crea que ninguna idea sola podría dar",
      "riesgo": "Qué riesgo concreto tiene esta combinación en particular (ej: complejidad técnica, expectativa del usuario, modelo de negocio)"
    }
  ],
  "riesgosIntegracion": [
    "Riesgo principal de integrar estas ideas: ¿complejidad de UX, conflicto de modelos de negocio, dependencias técnicas?",
    "Segundo riesgo — puede ser organizacional, técnico, o de mercado",
    "Tercer riesgo si aplica"
  ],
  "propuestaValorAmpliada": "Ampliación de la propuesta de valor: tomá lo que el equipo describió y enriquecelo con los beneficios específicos que la hibridación agrega para el usuario, el negocio, y el mercado. ¿Qué ventaja competitiva crea esta combinación?",
  "recommendations": [
    "Próximo paso inmediato para validar que la hibridación funciona (ej: prototipo de la integración, test de concepto con usuarios)",
    "Cómo simplificar la hibridación si hay demasiada complejidad — qué elemento podría sacarse sin perder el valor central",
    "Qué investigación adicional se necesita antes de desarrollar la idea híbrida"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- En sinergiasDetectadas: analizá las combinaciones documentadas por el equipo; si no hay combinaciones explícitas, derivalas de las ideas base.
- Mínimo 2 elementosClave, 1 sinergiasDetectadas (o tantas como combinaciones haya), 2 riesgosIntegracion, 3 recommendations.
- Si la propuesta de valor ya está documentada por el equipo, expandila con tu análisis — no la repitas tal cual.`;
  }

  private formatData(dto: HibridacionAgregacionAnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== HIBRIDACIÓN POR AGREGACIÓN ==='];

    if (data.contexto) lines.push(`\nCONTEXTO DEL RETO:\n"${data.contexto}"`);
    if (data.tecnica) lines.push(`\nTÉCNICA DE AGREGACIÓN: ${TECNICA_LABELS[data.tecnica] ?? data.tecnica}`);

    if (data.ideasBase?.length) {
      lines.push(`\nIDEAS BASE (${data.ideasBase.length}):`);
      data.ideasBase.forEach((idea, i) => {
        lines.push(`\n  ${i + 1}. ${idea.nombre || '[Sin nombre]'}`);
        if (idea.descripcion) lines.push(`     Descripción: ${idea.descripcion}`);
        if (idea.elementos?.length) {
          lines.push(`     Elementos/Features:`);
          idea.elementos.forEach(el => lines.push(`       • ${el}`));
        }
      });
    }

    if (data.combinaciones?.length) {
      lines.push(`\nCOMBINACIONES DOCUMENTADAS:`);
      data.combinaciones.forEach((comb, i) => {
        if (comb.elementoA || comb.elementoB) {
          lines.push(`\n  ${i + 1}. ${comb.elementoA || '[Elemento A]'} + ${comb.elementoB || '[Elemento B]'}`);
          if (comb.resultado) lines.push(`     Resultado: ${comb.resultado}`);
        }
      });
    }

    if (data.ideaHibrida) lines.push(`\nIDEA HÍBRIDA RESULTANTE:\n"${data.ideaHibrida}"`);
    if (data.propuestaValor) lines.push(`\nPROPUESTA DE VALOR:\n"${data.propuestaValor}"`);

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
