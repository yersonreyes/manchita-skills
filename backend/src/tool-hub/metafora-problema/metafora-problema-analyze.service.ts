import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { MetaforaProblemaAnalyzeReqDto } from './dto/metafora-problema-analyze.req.dto';
import {
  MetaforaProblemaAnalyzeResDto,
  MetaforaProblemaReportDto,
} from './dto/metafora-problema-analyze.res.dto';
import {
  buildProjectContextSection,
  ProjectBriefContext,
} from '../shared/project-context';

@Injectable()
export class MetaforaProblemaAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(
    dto: MetaforaProblemaAnalyzeReqDto,
  ): Promise<MetaforaProblemaAnalyzeResDto> {
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

    let report: MetaforaProblemaReportDto;
    try {
      report = JSON.parse(this.extractJson(raw)) as MetaforaProblemaReportDto;
    } catch {
      console.error('[MetaforaProblemaAnalyzeService] Raw AI response:', raw);
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

    return `Sos un experto en Design Thinking, pensamiento metafórico y encuadre creativo de problemas. Tu especialidad es evaluar si una metáfora es "fértil" — es decir, si genera múltiples insights accionables para el diseño, si es comprensible para stakeholders no técnicos, y si sugiere direcciones de solución sin dictar la solución concreta.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá las metáforas documentadas para el problema de diseño y generá un análisis estratégico en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 2-3 oraciones: qué tan fértiles son las metáforas exploradas, cuál captura mejor la esencia del problema, y qué perspectivas nuevas habilitan para el proceso de diseño.",
  "analisisPorMetafora": [
    {
      "titulo": "Título exacto de la metáfora",
      "fertilidad": "Evaluación de qué tan generativa es esta metáfora — si sugiere múltiples direcciones de diseño, si es fácil de comunicar, si resuena emocionalmente con el problema",
      "insightsDerivados": [
        "Insight concreto que esta metáfora revela sobre el problema",
        "Segundo insight derivado de aplicar la metáfora al problema"
      ],
      "limitaciones": "Qué aspectos del problema NO captura esta metáfora o dónde la analogía se rompe",
      "aplicacionesPotenciales": [
        "Cómo aplicar esta metáfora en una presentación a stakeholders",
        "Cómo usar esta metáfora como punto de partida para ideación"
      ]
    }
  ],
  "metaforaRecomendada": "Cuál metáfora recomendás usar y por qué — considerando fertilidad, comunicabilidad y relevancia para el problema documentado",
  "insightsClave": [
    "Insight transversal que emerge de explorar todas las metáforas juntas",
    "Segundo insight clave que no era obvio antes de la exploración metafórica",
    "Tercer insight si existe"
  ],
  "implicacionesDeDiseno": [
    "Implicación concreta para el proceso de diseño derivada de la exploración metafórica",
    "Segunda implicación — qué principios de diseño sugieren las metáforas",
    "Tercera implicación si aplica"
  ],
  "recommendations": [
    "Cómo usar la metáfora seleccionada en la próxima etapa del proceso",
    "Cómo comunicar el problema a stakeholders usando la metáfora recomendada",
    "Qué explorar en la fase de ideación a partir de los insights derivados"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- Una buena metáfora es "fértil": sugiere múltiples soluciones sin prescribir una sola.
- Una metáfora NO es buena si ya incluye la solución implícita (ej: "es como una app sin buscador" ya dice "agregar buscador").
- Los insights deben ser perspectivas nuevas sobre el problema, no reformulaciones del mismo.
- Las implicaciones de diseño deben ser principios o criterios, no features específicos.
- Si el problema original está vacío, basate en las metáforas para inferirlo.
- Mínimo 2 insights derivados por metáfora, 2 insightsClave, 2 implicacionesDeDiseno, 3 recommendations.`;
  }

  private formatData(dto: MetaforaProblemaAnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== METÁFORA DEL PROBLEMA ==='];

    if (data.problemaOriginal) {
      lines.push(`\nPROBLEMA ORIGINAL:\n${data.problemaOriginal}`);
    } else {
      lines.push('\nPROBLEMA ORIGINAL: [No definido]');
    }

    lines.push('\nMETÁFORAS EXPLORADAS:');
    if (!data.metaforas?.length) {
      lines.push('[No hay metáforas registradas]');
    } else {
      data.metaforas.forEach((m, i) => {
        lines.push(`\n--- Metáfora ${i + 1} ---`);
        if (m.titulo) lines.push(`Título: ${m.titulo}`);
        if (m.tipo) lines.push(`Tipo: ${m.tipo}`);
        if (m.descripcion) lines.push(`Descripción: ${m.descripcion}`);
        if (m.insights?.length) {
          lines.push('Insights documentados:');
          m.insights.forEach((ins) => lines.push(`  • ${ins}`));
        }
      });
    }

    if (data.metaforaSeleccionada) {
      lines.push(
        `\nMETÁFORA SELECCIONADA POR EL EQUIPO:\n"${data.metaforaSeleccionada}"`,
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
