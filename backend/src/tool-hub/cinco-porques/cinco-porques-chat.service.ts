import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { CincoPorquesChatReqDto } from './dto/cinco-porques.req.dto';
import { CincoPorquesChatResDto } from './dto/cinco-porques.res.dto';
import { AiMessage } from '../../ai/providers/ai-provider.interface';
import { buildProjectContextSection, ProjectBriefContext } from '../shared/project-context';

@Injectable()
export class CincoPorquesChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(dto: CincoPorquesChatReqDto): Promise<CincoPorquesChatResDto> {
    const { tool, project } = await this.loadContext(dto.toolApplicationId);
    const systemPrompt = this.buildSystemPrompt(tool, project);

    const messages: AiMessage[] = [
      ...dto.history,
      { role: 'user', content: dto.userMessage },
    ];

    const assistantMessage = await this.aiService.chat(messages, systemPrompt, 512);
    const turnCount = Math.floor(dto.history.length / 2) + 1;

    return { assistantMessage, turnCount };
  }

  private buildSystemPrompt(
    tool: { nombre: string; descripcion: string; comoSeUsa: string | null },
    project: ProjectBriefContext,
  ): string {
    const projectSection = buildProjectContextSection(project);

    return `Sos un facilitador experto en Design Thinking aplicando la técnica "${tool.nombre}".

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU ROL:
- Actuás exclusivamente como questioner: hacés UNA sola pregunta por turno.
- Tu objetivo es profundizar el análisis del usuario con preguntas que comiencen con "¿Por qué...?", "¿Qué origina...?" o similar, según corresponda a la técnica.
- Nunca das la respuesta al usuario. Nunca resolvés el problema por él.
- Mantenés el contexto del hilo de conversación para que cada pregunta sea más específica que la anterior.
- Tu tono es profesional, curioso y empático.
- Respondés siempre en español.
- Tu respuesta es únicamente la pregunta, sin saludos, prefacios ni conclusiones.`;
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
