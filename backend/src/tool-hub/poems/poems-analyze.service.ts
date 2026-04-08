import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { PoemsAnalyzeReqDto } from './dto/poems-analyze.req.dto';
import {
  PoemsAnalyzeResDto,
  PoemsReportDto,
} from './dto/poems-analyze.res.dto';
import {
  buildProjectContextSection,
  ProjectBriefContext,
} from '../shared/project-context';

@Injectable()
export class PoemsAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(dto: PoemsAnalyzeReqDto): Promise<PoemsAnalyzeResDto> {
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

    let report: PoemsReportDto;
    try {
      report = JSON.parse(this.extractJson(raw)) as PoemsReportDto;
    } catch {
      console.error('[PoemsAnalyzeService] Raw AI response:', raw);
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

    return `Sos un experto en síntesis de investigación cualitativa y en el framework POEMS (People, Objects, Environments, Messages, Services) aplicado al diseño de experiencias.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá las observaciones cargadas en cada dimensión POEMS y generá un análisis de síntesis en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 3-4 oraciones: cuántas dimensiones se documentaron, qué contexto fue observado, cuántas observaciones totales hay, y cuál es el hallazgo más significativo que emerge del cruce de dimensiones.",
  "insightsPorDimension": [
    {
      "dimension": "People",
      "insight": "Insight derivado de las observaciones sobre personas — qué revela su comportamiento, rol o interacción sobre el problema"
    },
    {
      "dimension": "Objects",
      "insight": "Insight sobre los objetos — qué dicen los artefactos físicos o digitales sobre cómo las personas resuelven o evitan problemas"
    },
    {
      "dimension": "Environment",
      "insight": "Insight sobre el entorno — cómo el contexto físico o social habilita o limita comportamientos"
    },
    {
      "dimension": "Messages",
      "insight": "Insight sobre los mensajes — qué comunican (o no comunican) los signos, carteles, textos o comunicaciones presentes"
    },
    {
      "dimension": "Services",
      "insight": "Insight sobre los servicios — qué revela la prestación de servicios sobre expectativas no cumplidas o fricciones sistémicas"
    }
  ],
  "patronesCross": [
    "Patrón que emerge al cruzar DOS O MÁS dimensiones — algo que se ve solo cuando se conectan las observaciones entre sí",
    "Segundo patrón transversal con énfasis en la tensión entre lo que el entorno propone y lo que las personas hacen",
    "Tercer patrón relevante"
  ],
  "dimensionMasRica": "Nombre de la dimensión con más observaciones o más reveladora, y una explicación de por qué aporta más al entendimiento del problema",
  "tensionesYContradicciones": [
    "Contradicción entre dos dimensiones — por ejemplo entre lo que dicen los mensajes y lo que hacen las personas",
    "Segunda tensión relevante con qué implica para el diseño"
  ],
  "oportunidades": [
    "Oportunidad de diseño concreta derivada del análisis POEMS — fundamentada en evidencia específica de las observaciones",
    "Segunda oportunidad identificada en el cruce de dimensiones",
    "Tercera oportunidad prioritaria"
  ],
  "recommendations": [
    "Recomendación accionable para el equipo de diseño que responde directamente a lo observado",
    "Segunda recomendación concreta con dimensión POEMS que la fundamenta",
    "Tercera recomendación estratégica"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- Solo incluí las dimensiones que tienen observaciones en insightsPorDimension.
- Los patronesCross son el corazón del análisis POEMS — son lo que NO se ve mirando cada dimensión por separado.
- Las tensionesYContradicciones identifican donde el sistema "dice una cosa pero hace otra".
- Mínimo 3 patronesCross, 2 tensionesYContradicciones, 3 oportunidades, 3 recommendations.`;
  }

  private formatData(dto: PoemsAnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== POEMS ==='];

    if (data.contexto) lines.push(`Contexto: ${data.contexto}`);
    if (data.sintesis) lines.push(`Síntesis del equipo: ${data.sintesis}`);

    const dimensions: Array<{ label: string; items: string[] }> = [
      { label: 'PEOPLE (Personas)', items: data.people ?? [] },
      { label: 'OBJECTS (Objetos)', items: data.objects ?? [] },
      { label: 'ENVIRONMENT (Entorno)', items: data.environment ?? [] },
      { label: 'MESSAGES (Mensajes)', items: data.messages ?? [] },
      { label: 'SERVICES (Servicios)', items: data.services ?? [] },
    ];

    for (const dim of dimensions) {
      if (dim.items.length > 0) {
        lines.push(`\n--- ${dim.label} ---`);
        dim.items.forEach((item) => lines.push(`  • ${item}`));
      }
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
