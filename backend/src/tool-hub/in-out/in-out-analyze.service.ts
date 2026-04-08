import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import {
  InOutAnalyzeReqDto,
  InOutInputItemDto,
  InOutOutputItemDto,
} from './dto/in-out-analyze.req.dto';
import {
  InOutAnalyzeResDto,
  InOutReportDto,
} from './dto/in-out-analyze.res.dto';
import {
  buildProjectContextSection,
  ProjectBriefContext,
} from '../shared/project-context';

@Injectable()
export class InOutAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(
    dto: InOutAnalyzeReqDto,
    currentVersion: number,
  ): Promise<InOutAnalyzeResDto> {
    const { tool, project } = await this.loadContext(dto.toolApplicationId);
    const systemPrompt = this.buildSystemPrompt(tool, project);
    const dataText = this.formatData(dto);

    const raw = await this.aiService.chat(
      [
        {
          role: 'user',
          content: `${dataText}\n\nGenerá el informe en JSON ahora.`,
        },
      ],
      systemPrompt,
      2048,
    );

    let report: InOutReportDto;
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

    return `Sos un experto en análisis de sistemas, Design Thinking y mapeo de flujos de valor, especializado en el Diagrama de Input-Output.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá el diagrama de In/Out proporcionado. Tu objetivo es:
1. Identificar inputs que probablemente se están ignorando (inputs ocultos)
2. Identificar outputs que el sistema genera pero que no son evidentes (outputs ocultos)
3. Detectar gaps, desconexiones o puntos débiles en el flujo
4. Generar recomendaciones concretas y priorizadas

Generá el informe en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "párrafo de 3-4 oraciones que sintetiza el sistema analizado, su salud general y los hallazgos más importantes",
  "inputsOcultos": [
    "input que no fue considerado y que probablemente afecta al proceso — ser específico sobre qué es y por qué importa",
    "otro input oculto"
  ],
  "outputsOcultos": [
    "output que el sistema genera implícitamente y que no fue documentado — incluir si es positivo o negativo",
    "otro output oculto"
  ],
  "gapsIdentificados": [
    "brecha o desconexión específica en el flujo — qué falta, qué está desalineado, qué es ineficiente",
    "otro gap"
  ],
  "recommendations": [
    "acción concreta y específica ordenada por impacto potencial",
    "otra acción"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- Si hay muy pocos datos, indicalo en executiveSummary y generá al menos 2 items por sección.
- Las recomendaciones deben ser accionables y ordenadas por impacto.
- "inputsOcultos" y "outputsOcultos" son hallazgos de análisis crítico — aportá valor real, no repitas lo que ya está documentado.`;
  }

  private formatData(dto: InOutAnalyzeReqDto): string {
    const formatInputs = (inputs: InOutInputItemDto[]) =>
      inputs.length > 0
        ? inputs
            .map(
              (inp, i) =>
                `${i + 1}. [${inp.tipo.toUpperCase()}] ${inp.descripcion || '(sin descripción)'}`,
            )
            .join('\n')
        : '(ninguno registrado)';

    const formatOutputs = (outputs: InOutOutputItemDto[]) =>
      outputs.length > 0
        ? outputs
            .map(
              (out, i) =>
                `${i + 1}. [${out.tipo.toUpperCase()}] ${out.descripcion || '(sin descripción)'}`,
            )
            .join('\n')
        : '(ninguno registrado)';

    return `=== PROCESO / SISTEMA ===
${dto.data.proceso || '(sin descripción del proceso)'}

=== INPUTS ===
${formatInputs(dto.data.inputs)}

=== OUTPUTS ===
${formatOutputs(dto.data.outputs)}`.trim();
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
