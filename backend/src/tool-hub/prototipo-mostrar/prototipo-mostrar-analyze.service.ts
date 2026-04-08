import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { PrototipoMostrarAnalyzeReqDto } from './dto/prototipo-mostrar-analyze.req.dto';
import {
  PrototipoMostrarAnalyzeResDto,
  PrototipoMostrarReportDto,
} from './dto/prototipo-mostrar-analyze.res.dto';
import {
  buildProjectContextSection,
  ProjectBriefContext,
} from '../shared/project-context';

const NIVEL_LABELS: Record<string, string> = {
  estatico: 'Demo estático (screenshots, mockups)',
  interactivo: 'Demo interactivo (prototipo clickable)',
  video: 'Demo en video (video del flujo completo)',
  mvp: 'MVP funcional (producto funcional real)',
};

@Injectable()
export class PrototipoMostrarAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(
    dto: PrototipoMostrarAnalyzeReqDto,
  ): Promise<PrototipoMostrarAnalyzeResDto> {
    const { tool, project } = await this.loadContext(dto.toolApplicationId);
    const systemPrompt = this.buildSystemPrompt(tool, project);
    const dataText = this.formatData(dto);

    const raw = await this.aiService.chat(
      [
        {
          role: 'user',
          content: `${dataText}\n\nGenerá el análisis en JSON ahora.`,
        },
      ],
      systemPrompt,
      2048,
    );

    let report: PrototipoMostrarReportDto;
    try {
      report = JSON.parse(this.extractJson(raw)) as PrototipoMostrarReportDto;
    } catch {
      console.error('[PrototipoMostrarAnalyzeService] Raw AI response:', raw);
      throw new UnprocessableEntityException(
        'La respuesta del AI no es JSON válido',
      );
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

    return `Sos un experto en comunicación de producto, pitch de ideas y presentación ante stakeholders. Tu especialidad es analizar prototipos de demostración: evaluar la efectividad narrativa de la presentación, identificar qué tan bien está construida la historia del producto, detectar los gaps entre lo que el equipo quiere comunicar y lo que realmente va a impactar a la audiencia, y sintetizar el feedback recibido en patrones accionables.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá la preparación y resultados de la presentación documentada y generá un análisis de efectividad en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 2-3 oraciones: para quién fue la presentación, qué nivel de demo se usó, cuál era el objetivo y si se logró o qué quedó pendiente.",
  "efectividadNarrativa": "Evaluación de qué tan bien construida está la historia del producto: ¿la secuencia problema → solución → beneficio está clara? ¿El mensaje clave es memorable y específico? ¿La audiencia puede entender el valor sin necesitar contexto técnico? Identificá qué funciona y qué falta en la narrativa.",
  "fortalezasDelPitch": [
    "Algo concreto que el equipo está haciendo bien — puede ser sobre la narrativa, la fidelidad del demo, los beneficios documentados o las preguntas anticipadas",
    "Segunda fortaleza — puede ser la elección del nivel de demo para la audiencia específica",
    "Más fortalezas si las hay"
  ],
  "gapsIdentificados": [
    "Gap crítico: algo que falta o está débil y puede costarle la presentación — puede ser el mensaje, la preparación para preguntas difíciles, la conexión entre el problema y la solución",
    "Segundo gap — puede ser sobre la audiencia (¿el nivel de demo es el adecuado para ellos?) o sobre los beneficios (¿están cuantificados?)",
    "Más gaps si los hay"
  ],
  "feedbackPatterns": [
    "Patrón en el feedback recibido — si hay múltiples feedbacks, qué tema común emerge",
    "Segundo patrón si hay feedback documentado",
    "Si no hay feedback aún, array vacío []"
  ],
  "pasosSiguientes": [
    "Acción concreta post-presentación — si se aprobó algo, qué viene; si no, qué habría que mejorar para la próxima presentación",
    "Segunda acción — puede ser incorporar el feedback en el prototipo o preparar una versión mejorada del pitch",
    "Tercera acción si aplica"
  ],
  "recommendations": [
    "Cómo fortalecer el mensaje clave para que sea más memorable e impactante para esta audiencia específica",
    "Qué elemento de la demo o del pitch tiene mayor retorno de inversión para mejorar antes de la próxima presentación",
    "Cómo manejar las preguntas difíciles que quedaron sin respuesta preparada"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- Si no hay feedback documentado (resultadosPresentacion vacío o feedbackRecibido vacío), analizá la preparación pre-presentación y evaluá los riesgos antes de que ocurra.
- Los gapsIdentificados deben ser honestos — si el pitch está incompleto o el mensaje es débil, decilo con claridad.
- feedbackPatterns: si no hay feedback, devolvé un array vacío [].
- Mínimo 2 fortalezasDelPitch, 2 gapsIdentificados, 3 recommendations.`;
  }

  private formatData(dto: PrototipoMostrarAnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== PROTOTIPO PARA MOSTRAR ==='];

    if (data.audiencia) lines.push(`\nAUDIENCIA: ${data.audiencia}`);
    if (data.nivelDemo)
      lines.push(
        `NIVEL DE DEMO: ${NIVEL_LABELS[data.nivelDemo] ?? data.nivelDemo}`,
      );

    if (data.mensajeClave)
      lines.push(`\nMENSAJE CLAVE:\n"${data.mensajeClave}"`);
    if (data.problemaQueResuelve)
      lines.push(`\nPROBLEMA QUE RESUELVE:\n"${data.problemaQueResuelve}"`);

    if (data.beneficiosDestacados?.length) {
      lines.push(`\nBENEFICIOS A DESTACAR:`);
      data.beneficiosDestacados.forEach((b) => {
        if (b) lines.push(`  • ${b}`);
      });
    }

    if (data.herramientasUsadas?.length) {
      lines.push(
        `\nHERRAMIENTAS USADAS: ${data.herramientasUsadas.join(', ')}`,
      );
    }

    if (data.preguntasAnticipadas?.length) {
      lines.push(
        `\nPREGUNTAS ANTICIPADAS (${data.preguntasAnticipadas.length}):`,
      );
      data.preguntasAnticipadas.forEach((qa, i) => {
        if (qa.pregunta) {
          lines.push(`\n  ${i + 1}. Q: "${qa.pregunta}"`);
          if (qa.respuesta) lines.push(`     A: "${qa.respuesta}"`);
          else lines.push(`     A: (sin respuesta preparada)`);
        }
      });
    }

    if (data.resultadosPresentacion) {
      lines.push(
        `\nRESULTADOS DE LA PRESENTACIÓN:\n"${data.resultadosPresentacion}"`,
      );
    }

    if (data.feedbackRecibido?.length) {
      lines.push(`\nFEEDBACK RECIBIDO:`);
      data.feedbackRecibido.forEach((f) => {
        if (f) lines.push(`  • "${f}"`);
      });
    }

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
