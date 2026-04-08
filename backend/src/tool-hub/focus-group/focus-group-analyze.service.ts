import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { FocusGroupAnalyzeReqDto } from './dto/focus-group-analyze.req.dto';
import {
  FocusGroupAnalyzeResDto,
  FocusGroupReportDto,
} from './dto/focus-group-analyze.res.dto';
import {
  buildProjectContextSection,
  ProjectBriefContext,
} from '../shared/project-context';

@Injectable()
export class FocusGroupAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(
    dto: FocusGroupAnalyzeReqDto,
  ): Promise<FocusGroupAnalyzeResDto> {
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

    let report: FocusGroupReportDto;
    try {
      report = JSON.parse(this.extractJson(raw)) as FocusGroupReportDto;
    } catch {
      console.error('[FocusGroupAnalyzeService] Raw AI response:', raw);
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

    return `Sos un experto en investigación cualitativa, facilitación de grupos focales y análisis de dinámica grupal.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá el focus group registrado y generá un análisis de insights grupales en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 3-4 oraciones: quiénes participaron, cuáles fueron los temas centrales que emergieron, y cuál es el hallazgo más relevante sobre la dinámica grupal.",
  "patronesPrincipales": [
    "Patrón recurrente que apareció en múltiples respuestas o fue compartido por varios participantes",
    "Otro patrón con descripción del contexto en que emergió",
    "Tercer patrón relevante"
  ],
  "insights": [
    {
      "categoria": "Percepción / Comportamiento / Actitud / Necesidad / Tensión / Consenso",
      "insight": "El insight en sí: qué revela el grupo sobre el problema que estamos diseñando.",
      "evidencia": "Cita, paráfrasis o descripción del momento en que emergió este insight."
    }
  ],
  "consensos": [
    "Punto de acuerdo grupal: qué compartieron o validaron todos o la mayoría",
    "Otro consenso con contexto"
  ],
  "disensos": [
    "Punto de desacuerdo o debate: qué dividió al grupo y por qué",
    "Otra tensión o divergencia de opinión"
  ],
  "citasDestacadas": [
    "Cita textual o paráfrasis fiel que captura un insight importante del grupo",
    "Otra cita reveladora de la dinámica grupal"
  ],
  "dinamicasObservadas": "Descripción de 2-3 oraciones sobre la dinámica del grupo: quién lideró la conversación, cómo se influyeron mutuamente, si hubo efecto de conformidad social, quién aportó perspectivas divergentes.",
  "oportunidades": [
    "Oportunidad de diseño que emerge de los hallazgos grupales",
    "Segunda oportunidad accionable",
    "Tercera oportunidad"
  ],
  "recommendations": [
    "Implicación de diseño concreta basada en los hallazgos del focus group",
    "Segunda recomendación accionable",
    "Tercera recomendación"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- Los insights deben reflejar la dimensión GRUPAL — no solo lo que dijo un individuo, sino cómo el grupo como entidad reveló algo.
- Prestá especial atención a: efecto de conformidad social, cómo una opinión cambió otras, consensos implícitos y explícitos.
- Mínimo 3 patronesPrincipales, 3 insights, 2 consensos, 1 disenso, 2 citasDestacadas, 2 oportunidades, 3 recommendations.
- Las recommendations deben ser accionables para el equipo de diseño.`;
  }

  private formatData(dto: FocusGroupAnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== FOCUS GROUP ==='];

    if (data.objetivo) lines.push(`Objetivo: ${data.objetivo}`);
    if (data.perfilParticipantes)
      lines.push(`Perfil de participantes: ${data.perfilParticipantes}`);
    if (data.cantidadParticipantes)
      lines.push(`Cantidad de participantes: ${data.cantidadParticipantes}`);
    if (data.ubicacion) lines.push(`Ubicación: ${data.ubicacion}`);
    if (data.fecha) lines.push(`Fecha: ${data.fecha}`);

    if (data.preguntas?.length) {
      lines.push('\n--- GUÍA DE DISCUSIÓN ---');
      for (let i = 0; i < data.preguntas.length; i++) {
        const p = data.preguntas[i];
        if (!p.pregunta && !p.respuestasGrupales) continue;
        lines.push(
          `\n[${p.fase ?? 'Principal'}] P${i + 1}: ${p.pregunta || '(pregunta no registrada)'}`,
        );
        lines.push(
          `Respuestas grupales: ${p.respuestasGrupales || '(sin registro)'}`,
        );
      }
    }

    if (data.dinamicasGrupales) {
      lines.push(
        `\n--- DINÁMICAS GRUPALES OBSERVADAS ---\n${data.dinamicasGrupales}`,
      );
    }

    if (data.citasClave?.length) {
      lines.push('\n--- CITAS CLAVE REGISTRADAS ---');
      data.citasClave.forEach((c) => lines.push(`"${c}"`));
    }

    if (data.observaciones) {
      lines.push(`\n--- OBSERVACIONES GENERALES ---\n${data.observaciones}`);
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
