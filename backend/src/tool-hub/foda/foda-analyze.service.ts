import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { FodaAnalyzeReqDto, FodaItemsDto } from './dto/foda-analyze.req.dto';
import { FodaAnalyzeResDto, FodaReportDto } from './dto/foda-analyze.res.dto';
import {
  buildProjectContextSection,
  ProjectBriefContext,
} from '../shared/project-context';

@Injectable()
export class FodaAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(
    dto: FodaAnalyzeReqDto,
    currentVersion: number,
  ): Promise<FodaAnalyzeResDto> {
    const { tool, project } = await this.loadContext(dto.toolApplicationId);
    const systemPrompt = this.buildSystemPrompt(tool, project);
    const itemsText = this.formatItems(dto.items);

    const raw = await this.aiService.chat(
      [
        {
          role: 'user',
          content: `Aquí está el análisis FODA completo para analizar:\n\n${itemsText}\n\nGenerá el informe en JSON ahora.`,
        },
      ],
      systemPrompt,
      2048,
    );

    let report: FodaReportDto;
    try {
      report = JSON.parse(this.extractJson(raw));
    } catch {
      throw new UnprocessableEntityException(
        'La respuesta del AI no es JSON válido',
      );
    }

    return {
      version: currentVersion + 1,
      generatedAt: new Date().toISOString(),
      report,
    };
  }

  private buildSystemPrompt(
    tool: { nombre: string; descripcion: string; comoSeUsa: string | null },
    project: ProjectBriefContext,
  ): string {
    const projectSection = buildProjectContextSection(project);

    return `Sos un consultor estratégico experto en análisis FODA (Fortalezas, Oportunidades, Debilidades, Amenazas).

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá el FODA que se te proporciona y generá un informe estructurado en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "párrafo de 3-4 oraciones que sintetiza el estado estratégico general del proyecto o emprendimiento",
  "quadrantAnalysis": {
    "fortalezas":    { "observations": ["observación 1", "observación 2"], "suggestions": ["sugerencia para potenciar fortalezas"] },
    "oportunidades": { "observations": ["observación 1", "observación 2"], "suggestions": ["sugerencia para capitalizar oportunidades"] },
    "debilidades":   { "risks": ["riesgo derivado 1", "riesgo derivado 2"], "mitigations": ["acción de mitigación 1"] },
    "amenazas":      { "risks": ["riesgo derivado 1", "riesgo derivado 2"], "mitigations": ["acción de mitigación 1"] }
  },
  "strategicScore": 7,
  "keyOpportunities": ["oportunidad estratégica clave 1", "oportunidad estratégica clave 2"],
  "criticalThreats": ["amenaza crítica 1", "amenaza crítica 2"],
  "recommendations": ["recomendación accionable 1", "recomendación accionable 2", "recomendación accionable 3"]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto adicional antes ni después.
- strategicScore es un entero de 1 a 10 que refleja el balance estratégico general (fortalezas vs debilidades, oportunidades vs amenazas).
- Si un cuadrante está vacío, indicalo con "Cuadrante sin completar — no se puede analizar" en observations o risks.
- Cada array de observations/suggestions/risks/mitigations tiene entre 1 y 3 items.
- keyOpportunities son las 2-3 mayores oportunidades estratégicas cruzando fortalezas con oportunidades (análisis FO).
- criticalThreats son las 2-3 amenazas más urgentes cruzando debilidades con amenazas (análisis DA).
- recommendations son acciones concretas y prioritarias ordenadas por impacto.
- Respondés en español.`;
  }

  private formatItems(items: FodaItemsDto): string {
    const format = (arr: string[]) =>
      arr.length
        ? arr.map((v, i) => `${i + 1}. ${v}`).join('\n')
        : '(sin completar)';

    return `=== FORTALEZAS (Strengths) ===
${format(items.fortalezas)}

=== OPORTUNIDADES (Opportunities) ===
${format(items.oportunidades)}

=== DEBILIDADES (Weaknesses) ===
${format(items.debilidades)}

=== AMENAZAS (Threats) ===
${format(items.amenazas)}`.trim();
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
