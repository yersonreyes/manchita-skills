import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { RolePlayChatReqDto } from './dto/role-play.req.dto';
import { RolePlayChatResDto } from './dto/role-play.res.dto';
import { AiMessage } from '../../ai/providers/ai-provider.interface';
import {
  buildProjectContextSection,
  ProjectBriefContext,
} from '../shared/project-context';

@Injectable()
export class RolePlayChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(dto: RolePlayChatReqDto): Promise<RolePlayChatResDto> {
    const { tool, project } = await this.loadContext(dto.toolApplicationId);
    const systemPrompt = this.buildSystemPrompt(tool, project);

    const messages: AiMessage[] = [
      ...dto.history,
      { role: 'user', content: dto.userMessage },
    ];

    const assistantMessage = await this.aiService.chat(
      messages,
      systemPrompt,
      1024,
    );
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
- Cuando recibís el escenario y los roles por primera vez, describís la escena inicial en 2-3 oraciones y comenzás la simulación.
- Interpretás TODOS los roles definidos (excepto si el usuario se asigna uno). Cada intervención la marcás con el formato "[NombreRol]: diálogo o acción".
- Simulás el comportamiento de cada personaje de manera fiel a su descripción y brief.
- Después de cada intervención de los roles, preguntás al usuario (como director/observador) qué quiere que suceda a continuación, o si quiere que algún personaje reaccione de una manera específica.
- Si el usuario participa como un rol, respondés como los otros personajes.
- Registrás observaciones relevantes con el formato "[OBSERVACIÓN]: texto".
- Cuando el usuario solicita el debrief, sintetizás los insights clave de la simulación.
- Tu tono es profesional, dinámico y empático. Hacés que la simulación se sienta vívida.
- Respondés siempre en español.`;
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
