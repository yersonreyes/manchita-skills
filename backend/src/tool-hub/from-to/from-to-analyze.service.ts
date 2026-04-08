import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { FromToAnalyzeReqDto } from './dto/from-to-analyze.req.dto';
import {
  FromToAnalyzeResDto,
  FromToReportDto,
} from './dto/from-to-analyze.res.dto';
import {
  buildProjectContextSection,
  ProjectBriefContext,
} from '../shared/project-context';

@Injectable()
export class FromToAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(dto: FromToAnalyzeReqDto): Promise<FromToAnalyzeResDto> {
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

    let report: FromToReportDto;
    try {
      report = JSON.parse(this.extractJson(raw)) as FromToReportDto;
    } catch {
      console.error('[FromToAnalyzeService] Raw AI response:', raw);
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

    return `Sos un experto en diseño estratégico, definición de visión de producto y análisis de brechas entre el estado actual y el estado futuro deseado.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá los pares FROM-TO documentados y generá un análisis de visión y brechas en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 3-4 oraciones: cuántos pares FROM-TO se definieron, cuál es el alcance de la transformación propuesta, qué tipo de cambio implica (incremental, radical, sistémico), y cuál es la brecha más crítica a cerrar.",
  "analisisFrom": "Párrafo de análisis del estado actual: qué problemas o dolores se repiten en los FROM, cuál es el patrón general de la situación actual, qué impacto tiene en el usuario o negocio",
  "analisisTo": "Párrafo de análisis de la visión futura: qué tipo de experiencia o estado se persigue en los TO, si la visión es coherente y alcanzable, qué principios de diseño se pueden inferir",
  "transformacionesDestacadas": [
    {
      "from": "El estado actual específico (copiado o parafraseado del input)",
      "to": "El estado futuro específico (copiado o parafraseado del input)",
      "brecha": "Qué hace falta para cerrar esta brecha específica — la distancia entre el FROM y el TO"
    },
    {
      "from": "Segundo par FROM destacado",
      "to": "Segundo par TO",
      "brecha": "Brecha del segundo par con magnitud de cambio requerido"
    },
    {
      "from": "Tercer par FROM destacado",
      "to": "Tercer par TO",
      "brecha": "Brecha del tercer par"
    }
  ],
  "brechasCriticas": [
    "La brecha más importante de todo el diagrama — cuál es el cambio más difícil de lograr y por qué",
    "Segunda brecha crítica con dependencias o requisitos previos",
    "Tercera brecha relevante"
  ],
  "insightsEstrategicos": [
    "Insight sobre el patrón general de transformación — qué tipo de producto o servicio emergería si se lograran todos los TO",
    "Segundo insight sobre la coherencia entre los TO y si apuntan a la misma visión o hay contradicciones",
    "Tercer insight sobre lo que los FROM revelan del estado actual que va más allá de lo explícito"
  ],
  "oportunidades": [
    "Oportunidad de diseño concreta que surge de uno o más pares FROM-TO — fundamentada en la brecha identificada",
    "Segunda oportunidad con mayor potencial de impacto en el usuario",
    "Tercera oportunidad estratégica"
  ],
  "recommendations": [
    "Recomendación para priorizar qué brechas cerrar primero — basada en impacto vs. dificultad",
    "Recomendación para usar el From-To como herramienta de comunicación con stakeholders",
    "Recomendación estratégica sobre cómo validar que las soluciones van en la dirección del TO"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- Seleccioná las 3 transformaciones más significativas para transformacionesDestacadas — no tenés que incluir todas.
- El analisisFrom y analisisTo son síntesis de los patrones que aparecen en MÚLTIPLES pares, no un listado.
- Los insightsEstrategicos son lo que se ve al mirar el CONJUNTO de transformaciones, no par por par.
- Mínimo 3 brechasCriticas, 3 insightsEstrategicos, 2 oportunidades, 3 recommendations.`;
  }

  private formatData(dto: FromToAnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== FROM-TO ==='];

    if (data.titulo) lines.push(`Título: ${data.titulo}`);
    if (data.contextoActual)
      lines.push(`\nContexto actual (FROM): ${data.contextoActual}`);
    if (data.visionFuturo)
      lines.push(`Visión de futuro (TO): ${data.visionFuturo}`);

    if (data.transformaciones?.length) {
      lines.push(`\n--- PARES FROM-TO (${data.transformaciones.length}) ---`);
      data.transformaciones.forEach((t, i) => {
        lines.push(`\n[Par ${i + 1}]`);
        if (t.from) lines.push(`  FROM: ${t.from}`);
        if (t.to) lines.push(`  TO:   ${t.to}`);
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
