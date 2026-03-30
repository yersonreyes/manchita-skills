import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import {
  AnalogosAntilogosAnalyzeReqDto,
  AnalogoItemDto,
  AntilogoItemDto,
} from './dto/analogos-antilogos-analyze.req.dto';
import {
  AnalogosAntilogosAnalyzeResDto,
  AnalogosAntilogosReportDto,
} from './dto/analogos-antilogos-analyze.res.dto';
import { buildProjectContextSection, ProjectBriefContext } from '../shared/project-context';

@Injectable()
export class AnalogosAntilogosAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(
    dto: AnalogosAntilogosAnalyzeReqDto,
    currentVersion: number,
  ): Promise<AnalogosAntilogosAnalyzeResDto> {
    const { tool, project } = await this.loadContext(dto.toolApplicationId);
    const systemPrompt = this.buildSystemPrompt(tool, project);
    const dataText = this.formatItems(dto.items.analogos, dto.items.antilogos);

    const raw = await this.aiService.chat(
      [{ role: 'user', content: `${dataText}\n\nGenerá el informe en JSON ahora.` }],
      systemPrompt,
      2048,
    );

    let report: AnalogosAntilogosReportDto;
    try {
      report = JSON.parse(this.extractJson(raw));
    } catch {
      throw new UnprocessableEntityException('La respuesta del AI no es JSON válido');
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

    return `Sos un experto en innovación, pensamiento lateral y Design Thinking, especializado en la técnica de Análogos y Antilogos.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá los análogos (referentes exitosos de otras industrias) y antilogos (fracasos a evitar) proporcionados. Identificá los principios subyacentes, las lecciones clave y generá recomendaciones accionables.

Generá el informe en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "párrafo de 3-4 oraciones que sintetiza los patrones encontrados y su potencial de aplicación al proyecto",
  "analogoInsights": [
    {
      "industria": "nombre exacto de la industria del análogo",
      "principio": "principio subyacente que hace exitosa esa solución (no copies la solución, explicá el mecanismo)",
      "potencial": "cómo ese principio se puede aplicar concretamente al contexto del proyecto"
    }
  ],
  "antilogoLessons": [
    {
      "industria": "nombre exacto de la industria del antilogo",
      "leccion": "qué aprender del fracaso — la causa raíz del problema, no el síntoma",
      "safeguard": "acción concreta para protegerse de ese error en el diseño de la solución"
    }
  ],
  "synthesisPrinciples": [
    "principio integrador que emerge de combinar análogos y antilogos — máximo 3",
    "otro principio"
  ],
  "recommendations": [
    "acción concreta y priorizada 1",
    "acción concreta y priorizada 2",
    "acción concreta y priorizada 3"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Si no hay análogos, dejá "analogoInsights" como array vacío [].
- Si no hay antilogos, dejá "antilogoLessons" como array vacío [].
- En "synthesisPrinciples" integrá lo aprendido de ambas fuentes — si solo hay uno de los dos tipos, igual generá principios de síntesis.
- Respondés en español.
- Las recomendaciones deben ser accionables y ordenadas por impacto potencial.`;
  }

  private formatItems(analogos: AnalogoItemDto[], antilogos: AntilogoItemDto[]): string {
    const formatAnalogos =
      analogos.length > 0
        ? analogos
            .map(
              (a, i) =>
                `${i + 1}. Industria: ${a.industria}\n   Solución: ${a.solucion}${a.adaptacion ? `\n   Adaptación propuesta: ${a.adaptacion}` : ''}`,
            )
            .join('\n\n')
        : '(sin análogos registrados)';

    const formatAntilogos =
      antilogos.length > 0
        ? antilogos
            .map(
              (a, i) =>
                `${i + 1}. Industria: ${a.industria}\n   Fracaso: ${a.fracaso}${a.errorAEvitar ? `\n   Error a evitar: ${a.errorAEvitar}` : ''}`,
            )
            .join('\n\n')
        : '(sin antilogos registrados)';

    return `=== ANÁLOGOS (referentes exitosos de otras industrias) ===
${formatAnalogos}

=== ANTILOGOS (fracasos conocidos a evitar) ===
${formatAntilogos}`.trim();
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
