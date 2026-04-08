import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import {
  Perspectiva360AnalyzeReqDto,
  PerspectivaSectionDto,
} from './dto/perspectiva-360-analyze.req.dto';
import {
  Perspectiva360AnalyzeResDto,
  Perspectiva360ReportDto,
} from './dto/perspectiva-360-analyze.res.dto';
import {
  buildProjectContextSection,
  ProjectBriefContext,
} from '../shared/project-context';

const PERSPECTIVA_LABELS: Record<string, string> = {
  usuario: 'Usuario',
  negocio: 'Negocio',
  tecnologia: 'Tecnología',
  competencia: 'Competencia',
  stakeholders: 'Stakeholders',
  legal: 'Legal / Regulatorio',
  tendencias: 'Tendencias',
};

@Injectable()
export class Perspectiva360AnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(
    dto: Perspectiva360AnalyzeReqDto,
  ): Promise<Perspectiva360AnalyzeResDto> {
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

    let report: Perspectiva360ReportDto;
    try {
      report = JSON.parse(this.extractJson(raw)) as Perspectiva360ReportDto;
    } catch {
      console.error('[Perspectiva360AnalyzeService] Raw AI response:', raw);
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

    return `Sos un experto en strategic thinking, análisis holístico y design strategy.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá las perspectivas documentadas y generá una visión 360 en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 3-4 oraciones: qué se analizó, cuántas perspectivas se cubrieron, cuál es la tensión más importante y qué implicancia tiene para la estrategia.",
  "insightsClave": [
    "Insight que emerge de ver múltiples perspectivas juntas — no obvio desde una sola",
    "Segundo insight cross-perspectiva con implicancia estratégica",
    "Tercer insight que desafía supuestos del equipo"
  ],
  "tensionesDetectadas": [
    {
      "perspectivas": ["Perspectiva A", "Perspectiva B"],
      "tension": "Descripción precisa del conflicto entre estas dos perspectivas",
      "implicancia": "Qué decisión o trade-off fuerza esta tensión en el diseño"
    }
  ],
  "perspectivaMasRiesgosa": "Nombre de la perspectiva con mayor riesgo + por qué en una oración",
  "perspectivaMasOportunidad": "Nombre de la perspectiva con mayor oportunidad + por qué en una oración",
  "brechaCritica": "La brecha más importante entre lo que se necesita y lo que existe actualmente — máximo 2 oraciones",
  "oportunidades": [
    "Oportunidad estratégica concreta que emerge del análisis holístico",
    "Segunda oportunidad con por qué es viable desde la perspectiva 360",
    "Tercera oportunidad priorizada"
  ],
  "recommendations": [
    "Recomendación accionable que resuelve la tensión más crítica",
    "Segunda recomendación con quick win potencial",
    "Tercera recomendación de largo plazo"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- Los insights deben ser cross-perspectiva — lo que se ve cuando conectás dos o más perspectivas.
- Las tensiones son los conflictos reales entre perspectivas, no observaciones neutras.
- La brecha crítica es el gap más urgente e importante del análisis.
- Mínimo 3 insightsClave, 2 tensionesDetectadas, 2 oportunidades, 3 recommendations.`;
  }

  private formatData(dto: Perspectiva360AnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== PERSPECTIVA 360 ==='];

    if (data.objeto) lines.push(`Objeto de estudio: ${data.objeto}`);

    const perspectivas: [string, PerspectivaSectionDto][] = [
      ['usuario', data.usuario],
      ['negocio', data.negocio],
      ['tecnologia', data.tecnologia],
      ['competencia', data.competencia],
      ['stakeholders', data.stakeholders],
      ['legal', data.legal],
      ['tendencias', data.tendencias],
    ];

    for (const [key, section] of perspectivas) {
      if (!section?.insights?.length) continue;
      const label = PERSPECTIVA_LABELS[key] ?? key;
      lines.push(`\n--- ${label.toUpperCase()} ---`);
      section.insights.forEach((ins) => lines.push(`• ${ins}`));
      if (section.fuentes) lines.push(`Fuentes: ${section.fuentes}`);
      if (section.notas) lines.push(`Notas: ${section.notas}`);
    }

    if (data.sintesis)
      lines.push(`\n--- SÍNTESIS DEL EQUIPO ---\n${data.sintesis}`);

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
