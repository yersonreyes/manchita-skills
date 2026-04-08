import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { RolePlayAnalyzeReqDto } from './dto/role-play.req.dto';
import {
  RolePlayAnalyzeResDto,
  RolePlayAnalysisDto,
} from './dto/role-play.res.dto';
import {
  buildProjectContextSection,
  ProjectBriefContext,
} from '../shared/project-context';

@Injectable()
export class RolePlayAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(dto: RolePlayAnalyzeReqDto): Promise<RolePlayAnalyzeResDto> {
    const { tool, project } = await this.loadContext(dto.toolApplicationId);
    const systemPrompt = this.buildSystemPrompt(tool, project);

    const transcript = dto.history
      .map(
        (m) =>
          `${m.role === 'user' ? 'Director/Observador' : 'Facilitador IA (Roles)'}: ${m.content}`,
      )
      .join('\n\n');

    const raw = await this.aiService.chat(
      [
        {
          role: 'user',
          content: `Aquí está la simulación completa para analizar:\n\n${transcript}\n\nGenerá el análisis en JSON ahora.`,
        },
      ],
      systemPrompt,
      2048,
    );

    let analysis: RolePlayAnalysisDto;
    try {
      analysis = JSON.parse(this.extractJson(raw));
    } catch (err) {
      console.error(
        '[RolePlayAnalyzeService] Raw AI response that failed to parse:',
        raw,
      );
      throw new UnprocessableEntityException(
        'La respuesta del AI no es JSON válido',
      );
    }

    return { analysis };
  }

  private buildSystemPrompt(
    tool: { nombre: string; descripcion: string; comoSeUsa: string | null },
    project: ProjectBriefContext,
  ): string {
    const projectSection = buildProjectContextSection(project);

    return `Sos un analista experto en Design Thinking. Has facilitado una sesión de "${tool.nombre}" con un equipo.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá la simulación completa que se te proporciona y producí un análisis estructurado en JSON con EXACTAMENTE este formato:

{
  "summary": "párrafo de 2-3 oraciones que sintetiza lo que ocurrió en la simulación y los hallazgos principales",
  "insights": ["observación 1 derivada de la simulación", "observación 2", "observación 3"],
  "painPoints": ["dolor o fricción identificado 1", "dolor o fricción identificado 2"],
  "recommendations": ["acción concreta 1 para mejorar la experiencia", "acción concreta 2"]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto adicional antes ni después.
- Los insights son observaciones sobre el comportamiento de los personajes y las dinámicas que emergieron.
- Los painPoints son fricciones, problemas o momentos de tensión identificados en la simulación.
- Las recommendations son acciones concretas derivadas de los hallazgos.
- Respondés en español.`;
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
