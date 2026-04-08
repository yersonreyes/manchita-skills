import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { BusquedaMediosAnalyzeReqDto } from './dto/busqueda-medios-analyze.req.dto';
import {
  BusquedaMediosAnalyzeResDto,
  BusquedaMediosReportDto,
} from './dto/busqueda-medios-analyze.res.dto';
import {
  buildProjectContextSection,
  ProjectBriefContext,
} from '../shared/project-context';

@Injectable()
export class BusquedaMediosAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(
    dto: BusquedaMediosAnalyzeReqDto,
  ): Promise<BusquedaMediosAnalyzeResDto> {
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

    let report: BusquedaMediosReportDto;
    try {
      report = JSON.parse(this.extractJson(raw)) as BusquedaMediosReportDto;
    } catch {
      console.error('[BusquedaMediosAnalyzeService] Raw AI response:', raw);
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

    return `Sos un experto en investigación de medios, análisis de tendencias y comunicación estratégica.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá los hallazgos de la búsqueda de medios proporcionada y generá un análisis estratégico en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 3-4 oraciones: qué se investigó, qué panorama emerge, y cuál es el dato más relevante para el proyecto.",
  "tendenciasClave": [
    "Tendencia concreta que emerge de los hallazgos con datos o ejemplos específicos",
    "Otra tendencia relevante con contexto"
  ],
  "sentimentGeneral": "Descripción del tono y sentimiento predominante en los medios analizados. ¿Es optimista, alarmista, neutro? ¿Qué emociones activa el tema en el discurso público?",
  "narrativasPredominantes": [
    "Narrativa o frame dominante en cómo los medios abordan el tema",
    "Otra narrativa relevante con contexto de por qué importa para el diseño"
  ],
  "gapsIdentificados": [
    "Aspecto del tema que los medios no cubren o cubren mal",
    "Otro gap de cobertura o perspectiva ausente"
  ],
  "implicacionesDeDiseno": [
    "Qué implica este panorama mediático para el diseño de la solución",
    "Otra implicación concreta para las decisiones de diseño o comunicación",
    "Una tercera implicación relevante"
  ],
  "recommendations": [
    "Acción concreta recomendada para el equipo de diseño basada en el análisis",
    "Segunda recomendación estratégica",
    "Tercera recomendación"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- Mínimo 2 items en tendenciasClave, narrativasPredominantes, gapsIdentificados, implicacionesDeDiseno y recommendations.
- Las implicacionesDeDiseno deben ser específicas y accionables para el equipo de diseño, no genéricas.
- Si hay sentiment o tendencias ya identificadas por el usuario, integrá esa información en el análisis.`;
  }

  private formatData(dto: BusquedaMediosAnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== BÚSQUEDA DE MEDIOS ==='];

    if (data.tema) lines.push(`Tema investigado: ${data.tema}`);

    if (data.queries?.length) {
      lines.push(
        `\nQueries utilizadas:\n${data.queries.map((q) => `- ${q}`).join('\n')}`,
      );
    }

    if (data.hallazgos?.length) {
      lines.push('\n--- HALLAZGOS ---');
      for (const h of data.hallazgos) {
        lines.push(`\n[${h.tipo.toUpperCase()}] ${h.titulo}`);
        if (h.fuente) lines.push(`Fuente: ${h.fuente}`);
        if (h.insight) lines.push(`Insight: ${h.insight}`);
      }
    }

    if (data.tendencias?.length) {
      lines.push(
        `\n--- TENDENCIAS IDENTIFICADAS ---\n${data.tendencias.map((t) => `- ${t}`).join('\n')}`,
      );
    }

    if (data.sentiment) {
      lines.push(`\n--- SENTIMENT OBSERVADO ---\n${data.sentiment}`);
    }

    if (data.narrativas?.length) {
      lines.push(
        `\n--- NARRATIVAS OBSERVADAS ---\n${data.narrativas.map((n) => `- ${n}`).join('\n')}`,
      );
    }

    if (data.gaps?.length) {
      lines.push(
        `\n--- GAPS IDENTIFICADOS ---\n${data.gaps.map((g) => `- ${g}`).join('\n')}`,
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
