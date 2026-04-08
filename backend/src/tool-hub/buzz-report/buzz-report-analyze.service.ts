import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { BuzzReportAnalyzeReqDto } from './dto/buzz-report-analyze.req.dto';
import {
  BuzzReportAnalyzeResDto,
  BuzzReportReportDto,
} from './dto/buzz-report-analyze.res.dto';
import {
  buildProjectContextSection,
  ProjectBriefContext,
} from '../shared/project-context';

@Injectable()
export class BuzzReportAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(
    dto: BuzzReportAnalyzeReqDto,
  ): Promise<BuzzReportAnalyzeResDto> {
    const { tool, project } = await this.loadContext(dto.toolApplicationId);
    const systemPrompt = this.buildSystemPrompt(tool, project);
    const dataText = this.formatData(dto);

    const raw = await this.aiService.chat(
      [
        {
          role: 'user',
          content: `${dataText}\n\nGenerá el Buzz Report en JSON ahora.`,
        },
      ],
      systemPrompt,
      2048,
    );

    let report: BuzzReportReportDto;
    try {
      report = JSON.parse(this.extractJson(raw)) as BuzzReportReportDto;
    } catch {
      console.error('[BuzzReportAnalyzeService] Raw AI response:', raw);
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

    return `Sos un experto en monitoreo de medios digitales, análisis de redes sociales y gestión de reputación online.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá las menciones recopiladas y generá un Buzz Report estratégico en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 3-4 oraciones: qué se monitoreó, cuál es el estado de la conversación digital, y cuál es el dato más importante del período.",
  "sentimentBreakdown": {
    "positivo": 40,
    "neutro": 35,
    "negativo": 25
  },
  "sentimentNarrative": "Una oración que describe el tono dominante y qué lo está generando. Ej: 'El sentiment positivo está impulsado por el lanzamiento del nuevo producto, mientras que el negativo se concentra en problemas de entrega.'",
  "topCanales": [
    {
      "canal": "Instagram",
      "volumen": "Alta actividad",
      "sentiment": "positivo",
      "insight": "Las menciones en Instagram destacan el packaging del producto y generan contenido UGC espontáneo."
    }
  ],
  "temasPrincipales": [
    "Tema o hashtag recurrente con contexto de por qué importa",
    "Otro tema con su relevancia"
  ],
  "vocesInfluyentes": [
    "Descripción del perfil influyente y su impacto en la conversación",
    "Otra voz relevante"
  ],
  "oportunidades": [
    "Oportunidad concreta para capitalizar el buzz positivo o neutral",
    "Otra oportunidad basada en los datos"
  ],
  "riesgos": [
    "Riesgo reputacional o narrativa negativa que requiere atención",
    "Otro riesgo con contexto de urgencia"
  ],
  "recommendations": [
    "Acción concreta recomendada para los próximos 7-14 días",
    "Segunda recomendación estratégica",
    "Tercera recomendación"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- El campo "sentiment" en topCanales debe ser exactamente "positivo", "neutro" o "negativo".
- Los porcentajes en sentimentBreakdown deben sumar exactamente 100.
- Si hay pocas menciones, extrapolá tendencias con cautela y marcalas como preliminares en el executiveSummary.
- Mínimo 2 items en temasPrincipales, oportunidades, riesgos y recommendations.`;
  }

  private formatData(dto: BuzzReportAnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== BUZZ REPORT ==='];

    if (data.marca) lines.push(`Marca / Tema monitoreado: ${data.marca}`);
    if (data.periodo) lines.push(`Período: ${data.periodo}`);

    if (data.menciones?.length) {
      lines.push('\n--- MENCIONES ---');
      for (const m of data.menciones) {
        lines.push(
          `\n[${m.canal?.toUpperCase() ?? 'CANAL'}] Sentiment: ${m.sentiment}`,
        );
        if (m.autor) lines.push(`Autor: ${m.autor}`);
        if (m.contenido) lines.push(`Contenido: ${m.contenido}`);
        if (m.alcance) lines.push(`Alcance: ${m.alcance}`);
      }
    }

    if (data.temasRecurrentes?.length) {
      lines.push(
        `\n--- TEMAS RECURRENTES IDENTIFICADOS ---\n${data.temasRecurrentes.map((t) => `- ${t}`).join('\n')}`,
      );
    }

    if (data.vocesInfluyentes?.length) {
      lines.push(
        `\n--- VOCES INFLUYENTES IDENTIFICADAS ---\n${data.vocesInfluyentes.map((v) => `- ${v}`).join('\n')}`,
      );
    }

    if (data.sentimentOverall) {
      lines.push(
        `\n--- PERCEPCIÓN GENERAL OBSERVADA ---\n${data.sentimentOverall}`,
      );
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
