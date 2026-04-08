import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import {
  ShadowingAnalyzeReqDto,
  SesionShadowingDto,
} from './dto/shadowing-analyze.req.dto';
import {
  ShadowingAnalyzeResDto,
  ShadowingReportDto,
} from './dto/shadowing-analyze.res.dto';
import {
  buildProjectContextSection,
  ProjectBriefContext,
} from '../shared/project-context';

const TIPO_LABELS: Record<string, string> = {
  pasivo: 'Pasivo (solo observar)',
  activo: 'Activo (preguntas en pausas)',
  remoto: 'Remoto (cámara / screen share)',
  participativo: 'Participativo (ayudar mientras observa)',
};

@Injectable()
export class ShadowingAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(dto: ShadowingAnalyzeReqDto): Promise<ShadowingAnalyzeResDto> {
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

    let report: ShadowingReportDto;
    try {
      report = JSON.parse(this.extractJson(raw)) as ShadowingReportDto;
    } catch {
      console.error('[ShadowingAnalyzeService] Raw AI response:', raw);
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

    return `Sos un experto en investigación etnográfica, UX research y análisis de comportamiento de usuarios en contextos reales.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá las sesiones de shadowing documentadas y generá un análisis de insights en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 3-4 oraciones: cuántas sesiones se realizaron, con qué perfiles, cuántas observaciones se documentaron, y cuál es el insight más importante que emerge del comportamiento real observado.",
  "observacionesDestacadas": [
    {
      "participante": "Nombre o perfil del participante",
      "hora": "Hora o momento de la observación",
      "observacion": "Qué se observó — comportamiento específico, con detalle suficiente para ser accionable",
      "insight": "Qué revela este comportamiento sobre el usuario, su contexto o el problema"
    }
  ],
  "flujosDeTrabajo": [
    "Descripción de un flujo de trabajo real observado — cómo el usuario encadena acciones para lograr un objetivo",
    "Segundo flujo relevante con énfasis en las ineficiencias o adaptaciones que hace",
    "Tercer flujo o patrón de secuencia observado"
  ],
  "workaroundsEncontrados": [
    "Solución alternativa que el usuario inventó para resolver un problema — describí el problema original y la solución improvisada, y qué implica para el diseño",
    "Segundo workaround con su implicancia de diseño"
  ],
  "painPointsCriticos": [
    "Pain point observado directamente — más confiable que los auto-reportados porque es comportamiento real en contexto natural",
    "Segundo pain point con descripción de cuándo aparece y cómo afecta al usuario",
    "Tercer pain point prioritario"
  ],
  "decisiones": [
    "Patrón de toma de decisiones observado — qué criterios usa el usuario, qué descarta, qué prioriza",
    "Segundo patrón de decisión con contexto de cuándo aparece",
    "Tercer patrón relevante"
  ],
  "oportunidades": [
    "Oportunidad de diseño concreta derivada del comportamiento observado — específica y fundamentada en evidencia de campo",
    "Segunda oportunidad con por qué es viable y urgente según lo observado",
    "Tercera oportunidad priorizada"
  ],
  "recommendations": [
    "Recomendación accionable directamente derivada de las observaciones — qué cambiar y por qué la evidencia lo justifica",
    "Segunda recomendación concreta para el equipo de diseño",
    "Tercera recomendación estratégica de más largo plazo"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- Las observaciones destacadas deben ser las más reveladoras — las que sorprenden o contradicen supuestos.
- Los flujos de trabajo deben describir la secuencia REAL, no la ideal o documentada. Incluir desvíos, atajos, adaptaciones.
- Los workarounds son indicadores de problemas no resueltos — si no hay ninguno documentado, inferí posibles basándote en las observaciones.
- Los pain points observados son más valiosos que los auto-reportados — priorizalos.
- Mínimo 3 observacionesDestacadas, 3 flujosDeTrabajo, 2 workaroundsEncontrados, 3 painPointsCriticos, 2 decisiones, 2 oportunidades, 3 recommendations.
- Los insights deben ir más allá de lo obvio — buscá el "por qué detrás del qué".`;
  }

  private formatData(dto: ShadowingAnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== SHADOWING ==='];

    if (data.objetivo) lines.push(`Objetivo: ${data.objetivo}`);
    if (data.guiaObservacion)
      lines.push(`Guía de observación: ${data.guiaObservacion}`);

    if (data.sesiones?.length) {
      lines.push(`\n--- SESIONES DE SHADOWING (${data.sesiones.length}) ---`);
      for (let i = 0; i < data.sesiones.length; i++) {
        const s: SesionShadowingDto = data.sesiones[i];
        lines.push(
          `\n[SESIÓN ${i + 1}]${s.participante ? ` ${s.participante}` : ''}`,
        );
        if (s.tipo) lines.push(`Tipo: ${TIPO_LABELS[s.tipo] ?? s.tipo}`);
        if (s.duracion) lines.push(`Duración: ${s.duracion}`);
        if (s.contexto) lines.push(`Contexto: ${s.contexto}`);
        if (s.observaciones?.length) {
          lines.push(`Observaciones (${s.observaciones.length}):`);
          s.observaciones.forEach((obs) => {
            const parts: string[] = [];
            if (obs.hora) parts.push(`[${obs.hora}]`);
            if (obs.observacion) parts.push(obs.observacion);
            if (obs.insight) parts.push(`→ ${obs.insight}`);
            if (parts.length > 0) lines.push(`  • ${parts.join(' ')}`);
          });
        }
        if (s.notas) lines.push(`Notas: ${s.notas}`);
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
