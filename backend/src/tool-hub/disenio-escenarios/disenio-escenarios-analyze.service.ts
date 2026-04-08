import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import {
  DisenioEscenariosAnalyzeReqDto,
  EscenarioDto,
} from './dto/disenio-escenarios-analyze.req.dto';
import {
  DisenioEscenariosAnalyzeResDto,
  DisenioEscenariosReportDto,
} from './dto/disenio-escenarios-analyze.res.dto';
import {
  buildProjectContextSection,
  ProjectBriefContext,
} from '../shared/project-context';

const TIPO_LABELS: Record<string, string> = {
  'happy-path': 'Happy Path',
  'edge-case': 'Edge Case',
  error: 'Error / Failure',
  contextual: 'Contextual',
  'day-in-life': 'Day in the Life',
};

@Injectable()
export class DisenioEscenariosAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(
    dto: DisenioEscenariosAnalyzeReqDto,
  ): Promise<DisenioEscenariosAnalyzeResDto> {
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

    let report: DisenioEscenariosReportDto;
    try {
      report = JSON.parse(this.extractJson(raw)) as DisenioEscenariosReportDto;
    } catch {
      console.error('[DisenioEscenariosAnalyzeService] Raw AI response:', raw);
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

    return `Sos un experto en UX, Service Design y diseño de experiencias de usuario. Tu especialidad es analizar escenarios de usuario: identificar momentos mágicos y puntos de fricción en los flujos, detectar patrones emocionales entre escenarios, y convertir observaciones situacionales en oportunidades de diseño accionables.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá los escenarios de usuario documentados y generá un análisis estratégico en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 2-3 oraciones: cuántos y qué tipo de escenarios se analizaron, cuál es el patrón emocional dominante, y cuál es la oportunidad de diseño más importante.",
  "analisisEscenarios": [
    {
      "nombre": "Nombre del escenario tal como fue definido",
      "tipo": "happy-path|edge-case|error|contextual|day-in-life",
      "momentosMagicos": [
        "Momento positivo específico del flujo — cuándo el usuario siente satisfacción, deleite o alivio",
        "Otro momento mágico si hay"
      ],
      "puntosDeFriccion": [
        "Punto específico donde el usuario se frustra, duda o abandona",
        "Otro punto de fricción si hay"
      ],
      "emocionDominante": "La emoción principal que define la experiencia de este escenario — no solo 'buena' o 'mala', sino específica (ej: ansiedad por la espera, alivio al completar el pago)"
    }
  ],
  "patronesEmocionales": [
    "Patrón que se repite en múltiples escenarios — ej: ansiedad en los momentos de espera independientemente del tipo de escenario",
    "Segundo patrón — puede ser positivo o negativo",
    "Más patrones si hay suficientes escenarios para detectarlos"
  ],
  "friccionesComunes": [
    "Fricción que aparece en más de un escenario — el sistema de diseño necesita abordarla globalmente",
    "Segunda fricción común si la hay"
  ],
  "oportunidadesDiseno": [
    "Oportunidad de diseño concreta derivada del análisis — específica, no genérica (ej: 'notificación proactiva cuando el tiempo estimado cambia más de 5 minutos')",
    "Segunda oportunidad — puede ser para un tipo específico de escenario o para todos",
    "Tercera oportunidad de diseño"
  ],
  "recommendations": [
    "Próximo paso concreto: qué prototipar o validar primero con usuarios reales",
    "Cómo usar estos escenarios en el proceso de diseño del equipo (presentaciones, decisiones de feature)",
    "Qué escenarios adicionales crear para cubrir gaps en el análisis"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- En analisisEscenarios: analizá CADA escenario documentado.
- Sé específico en los momentosMagicos y puntosDeFriccion — no digas "el usuario se frustra", decí QUÉ lo frustra y en QUÉ paso.
- Los patronesEmocionales deben ser patrones CROSS-SCENARIO (que se ven en más de un escenario).
- Mínimo 2 oportunidadesDiseno, 3 recommendations.
- Si solo hay un escenario, adaptar patronesEmocionales y friccionesComunes a ese escenario.`;
  }

  private formatData(dto: DisenioEscenariosAnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== DISEÑO DE ESCENARIOS ==='];

    if (data.contextoGeneral)
      lines.push(
        `\nCONTEXTO DEL PRODUCTO/SERVICIO:\n"${data.contextoGeneral}"`,
      );

    if (data.escenarios?.length) {
      lines.push(`\nESCENARIOS DOCUMENTADOS (${data.escenarios.length}):`);
      data.escenarios.forEach((e, i) => {
        const tipoLabel = e.tipo ? ` [${TIPO_LABELS[e.tipo] ?? e.tipo}]` : '';
        lines.push(`\n${'─'.repeat(50)}`);
        lines.push(
          `ESCENARIO ${i + 1}: ${e.nombre || '[Sin nombre]'}${tipoLabel}`,
        );

        if (e.usuario || e.donde || e.cuando || e.objetivo) {
          lines.push('\nCONTEXTO:');
          if (e.usuario) lines.push(`  • Usuario: ${e.usuario}`);
          if (e.donde) lines.push(`  • Dónde: ${e.donde}`);
          if (e.cuando) lines.push(`  • Cuándo: ${e.cuando}`);
          if (e.objetivo) lines.push(`  • Objetivo: ${e.objetivo}`);
        }

        if (e.pasos?.length) {
          lines.push('\nFLUJO:');
          e.pasos.forEach((p, pi) => {
            const accion = p.accion || '[Sin acción]';
            lines.push(`  ${pi + 1}. ${accion}`);
            if (p.emocion) lines.push(`     → Emoción: ${p.emocion}`);
          });
        }

        if (e.oportunidades?.length) {
          lines.push('\nOPORTUNIDADES IDENTIFICADAS:');
          e.oportunidades.forEach((o) => lines.push(`  ✓ ${o}`));
        }
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
