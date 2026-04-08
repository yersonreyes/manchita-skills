import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { SeleccionIdeasAnalyzeReqDto } from './dto/seleccion-ideas-analyze.req.dto';
import {
  SeleccionIdeasAnalyzeResDto,
  SeleccionIdeasReportDto,
} from './dto/seleccion-ideas-analyze.res.dto';
import {
  buildProjectContextSection,
  ProjectBriefContext,
} from '../shared/project-context';

@Injectable()
export class SeleccionIdeasAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(
    dto: SeleccionIdeasAnalyzeReqDto,
  ): Promise<SeleccionIdeasAnalyzeResDto> {
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

    let report: SeleccionIdeasReportDto;
    try {
      report = JSON.parse(this.extractJson(raw)) as SeleccionIdeasReportDto;
    } catch {
      console.error('[SeleccionIdeasAnalyzeService] Raw AI response:', raw);
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

    return `Sos un experto en Design Thinking, innovation management y toma de decisiones estratégicas. Tu especialidad es analizar procesos de selección de ideas: evaluar cómo el equipo usó los criterios de evaluación, identificar patrones en las decisiones tomadas, detectar sesgos o puntos ciegos, y dar recomendaciones accionables para avanzar con las ideas seleccionadas.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá el proceso de selección de ideas documentado y generá un análisis estratégico en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 2-3 oraciones: cuántas ideas se evaluaron, cuáles fueron seleccionadas y por qué según los criterios, y cuál es la recomendación principal del análisis.",
  "analisisIdeasSeleccionadas": [
    {
      "idea": "Texto exacto de la idea seleccionada",
      "scoreTotal": 3.8,
      "puntosFuertes": [
        "Por qué este criterio la favorece — con detalle concreto",
        "Segundo punto fuerte con evidencia del scoring"
      ],
      "puntosDebiles": [
        "En qué criterio quedó más débil y qué riesgo implica",
        "Segundo punto débil si aplica"
      ],
      "recomendacion": "Qué debería hacer el equipo como siguiente paso concreto con esta idea"
    }
  ],
  "patronesDecision": [
    "Patrón observado en cómo el equipo priorizó los criterios — ej: se priorizó viabilidad sobre impacto",
    "Segundo patrón — ej: las ideas más votadas tenían en común cierta característica",
    "Tercer patrón si aplica — ej: las descartadas cayeron todas en el mismo criterio"
  ],
  "ideasRescatables": [
    "Idea no seleccionada que merece consideración futura — con justificación de por qué podría ser valiosa en otro contexto o iteración",
    "Segunda idea rescatable si aplica"
  ],
  "alertasDeEquipo": [
    "Alerta sobre posibles sesgos o problemas en el proceso de evaluación — ej: si un criterio dominó demasiado, si hubo ideas sin puntuar, si la dispersión de scores sugiere desacuerdo",
    "Segunda alerta si corresponde — ej: si solo hay 1 idea seleccionada el equipo podría estar apostando todo a una sola solución"
  ],
  "recommendations": [
    "Qué hacer con las ideas seleccionadas como próximo paso inmediato (ej: prototipar, validar con usuarios, estimar recursos)",
    "Cómo manejar las ideas en backlog — si mantenerlas activas para la siguiente iteración",
    "Si revisar los criterios o sus pesos para la próxima selección, y en qué dirección"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- En analisisIdeasSeleccionadas: incluí SOLO las ideas con estado "seleccionada". Si no hay ninguna, usá las que tengan score más alto.
- En scoreTotal: usá el score ponderado calculado (del campo ideaScores) redondeado a 1 decimal. Si no tenés el score pre-calculado, calculalo vos.
- Mínimo 1 analisisIdeasSeleccionadas, 2 patronesDecision, 1 ideasRescatables (si existen ideas descartadas o en backlog), 3 recommendations.
- Si no hay ideas en backlog o descartadas, podés omitir ideasRescatables o poner un array vacío.
- Las alertasDeEquipo son importantes: detectá si el proceso tuvo problemas (criterios desbalanceados, pocas ideas evaluadas, todas con el mismo score, etc.).`;
  }

  private formatData(dto: SeleccionIdeasAnalyzeReqDto): string {
    const { data, ideaScores } = dto;
    const lines: string[] = ['=== SELECCIÓN DE IDEAS ==='];

    if (data.contexto) lines.push(`\nCONTEXTO:\n"${data.contexto}"`);
    if (data.metodo) lines.push(`\nMÉTODO DE SELECCIÓN: ${data.metodo}`);

    if (data.criterios?.length) {
      const totalPeso = data.criterios.reduce((s, c) => s + (c.peso ?? 0), 0);
      lines.push(`\nCRITERIOS DE EVALUACIÓN (peso total: ${totalPeso}):`);
      data.criterios.forEach((c) => {
        lines.push(`  • ${c.nombre} (peso: ${c.peso ?? 0})`);
      });
    }

    lines.push(`\nTOTAL DE IDEAS EVALUADAS: ${data.ideas?.length ?? 0}`);

    if (data.ideas?.length) {
      // Ordenar por score desc
      const sorted = [...data.ideas].sort((a, b) => {
        const sa = ideaScores?.[a.id] ?? 0;
        const sb = ideaScores?.[b.id] ?? 0;
        return sb - sa;
      });

      const seleccionadas = sorted.filter((i) => i.estado === 'seleccionada');
      const backlog = sorted.filter((i) => i.estado === 'backlog');
      const descartadas = sorted.filter((i) => i.estado === 'descartada');
      const pendientes = sorted.filter(
        (i) => i.estado === 'pendiente' || !i.estado,
      );

      const formatIdea = (idea: (typeof sorted)[0]) => {
        const score = ideaScores?.[idea.id];
        const scoreStr =
          score !== undefined ? ` [Score: ${score.toFixed(1)}/5]` : '';
        const lines: string[] = [
          `  • ${idea.texto || '[Sin texto]'}${scoreStr}`,
        ];

        if (data.criterios?.length && idea.puntuaciones?.length) {
          data.criterios.forEach((c) => {
            const p = idea.puntuaciones.find((pu) => pu.criterioId === c.id);
            if (p?.valor) lines.push(`      ${c.nombre}: ${p.valor}/5`);
          });
        }

        if (idea.siguientePaso)
          lines.push(`      Siguiente paso: ${idea.siguientePaso}`);
        return lines.join('\n');
      };

      if (seleccionadas.length) {
        lines.push('\nIDEAS SELECCIONADAS:');
        seleccionadas.forEach((i) => lines.push(formatIdea(i)));
      }

      if (backlog.length) {
        lines.push('\nIDEAS EN BACKLOG:');
        backlog.forEach((i) => lines.push(formatIdea(i)));
      }

      if (descartadas.length) {
        lines.push('\nIDEAS DESCARTADAS:');
        descartadas.forEach((i) =>
          lines.push(`  • ${i.texto || '[Sin texto]'}`),
        );
      }

      if (pendientes.length) {
        lines.push('\nIDEAS PENDIENTES DE CLASIFICAR:');
        pendientes.forEach((i) => lines.push(formatIdea(i)));
      }
    }

    if (data.decision)
      lines.push(`\nDECISIÓN FINAL DOCUMENTADA:\n"${data.decision}"`);

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
