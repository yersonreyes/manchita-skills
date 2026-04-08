import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import {
  SafariAnalyzeReqDto,
  SesionSafariDto,
} from './dto/safari-analyze.req.dto';
import {
  SafariAnalyzeResDto,
  SafariReportDto,
} from './dto/safari-analyze.res.dto';
import {
  buildProjectContextSection,
  ProjectBriefContext,
} from '../shared/project-context';

@Injectable()
export class SafariAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(dto: SafariAnalyzeReqDto): Promise<SafariAnalyzeResDto> {
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

    let report: SafariReportDto;
    try {
      report = JSON.parse(this.extractJson(raw)) as SafariReportDto;
    } catch {
      console.error('[SafariAnalyzeService] Raw AI response:', raw);
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

    return `Sos un experto en design research, observación etnográfica y síntesis de insights de campo.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá las sesiones de observación del safari y generá un análisis de insights en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 3-4 oraciones: cuántas sesiones se realizaron, dónde, cuántas observaciones se documentaron, y cuál es el insight más importante que emerge del campo.",
  "observacionesDestacadas": [
    {
      "sesion": "Nombre o ubicación de la sesión",
      "momento": "Momento específico observado",
      "observacion": "Qué se observó — descripción precisa",
      "insight": "Qué revela esta observación sobre el usuario o el contexto"
    }
  ],
  "patronesComportamiento": [
    "Patrón que aparece en múltiples sesiones o usuarios — describilo con precisión y en qué contexto ocurre",
    "Segundo patrón de comportamiento observado en campo",
    "Tercer patrón relevante"
  ],
  "workaroundsEncontrados": [
    "Solución creativa que los usuarios inventaron para resolver un problema — describí el problema original y la solución improvisada",
    "Segundo workaround con su implicancia de diseño"
  ],
  "painPointsCriticos": [
    "Pain point observado directamente en campo — más confiable que el reportado en entrevistas porque es comportamiento real",
    "Segundo pain point crítico con su contexto de aparición",
    "Tercer pain point relevante"
  ],
  "momentosWow": [
    "Momento inesperado o comportamiento sorprendente que desafía los supuestos del equipo",
    "Segundo momento wow con qué oportunidad de diseño abre"
  ],
  "oportunidades": [
    "Oportunidad de diseño concreta que emerge del comportamiento observado — específica y fundamentada en la evidencia de campo",
    "Segunda oportunidad con por qué es viable y urgente",
    "Tercera oportunidad priorizada"
  ],
  "recommendations": [
    "Recomendación accionable directamente derivada de las observaciones de campo",
    "Segunda recomendación concreta para el equipo de diseño",
    "Tercera recomendación de largo plazo"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- Las observaciones destacadas deben ser las más reveladoras — las que no esperabas o que cambian la perspectiva.
- Los workarounds son ORO para el diseño: si no hay ninguno documentado, inferí posibles a partir de las observaciones.
- Los momentos WOW son los que hacen que el equipo diga "no lo habíamos pensado así".
- Mínimo 3 observacionesDestacadas, 3 patronesComportamiento, 2 workaroundsEncontrados, 3 painPointsCriticos, 2 momentosWow, 2 oportunidades, 3 recommendations.
- Priorizá insights de comportamiento real (lo que la gente HACE) sobre lo que dicen que harían.`;
  }

  private formatData(dto: SafariAnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== SAFARI / DESIGN SAFARI ==='];

    if (data.objetivo) lines.push(`Objetivo de observación: ${data.objetivo}`);
    if (data.guiaObservacion)
      lines.push(`Guía de observación: ${data.guiaObservacion}`);

    if (data.sesiones?.length) {
      lines.push(`\n--- SESIONES DE OBSERVACIÓN (${data.sesiones.length}) ---`);
      for (let i = 0; i < data.sesiones.length; i++) {
        const s: SesionSafariDto = data.sesiones[i];
        lines.push(
          `\n[SAFARI ${i + 1}]${s.ubicacion ? ` ${s.ubicacion}` : ''}`,
        );
        if (s.duracion) lines.push(`Duración: ${s.duracion}`);
        if (s.equipo) lines.push(`Equipo: ${s.equipo}`);
        if (s.observaciones?.length) {
          lines.push(`Observaciones (${s.observaciones.length}):`);
          s.observaciones.forEach((obs) => {
            const parts: string[] = [];
            if (obs.momento) parts.push(`[${obs.momento}]`);
            if (obs.observacion) parts.push(obs.observacion);
            if (obs.insight) parts.push(`→ ${obs.insight}`);
            if (parts.length > 0) lines.push(`  • ${parts.join(' ')}`);
          });
        }
        if (s.notas) lines.push(`Notas de la sesión: ${s.notas}`);
      }
    }

    if (data.sintesis) {
      lines.push(`\n--- SÍNTESIS DEL EQUIPO ---\n${data.sintesis}`);
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
