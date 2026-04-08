import { Injectable } from '@nestjs/common';
import { AiService } from '../../ai/ai.service';
import { ProjectBriefChatReqDto } from './dto/project-brief.req.dto';
import { ProjectBriefChatResDto } from './dto/project-brief.res.dto';
import { AiMessage } from '../../ai/providers/ai-provider.interface';
import {
  buildProjectContextSection,
  ProjectBriefContext,
} from '../shared/project-context';

const TIPO_LABELS: Record<string, string> = {
  STARTUP: 'Startup / Emprendimiento',
  PRODUCTO_DIGITAL: 'Producto digital',
  INVESTIGACION_UX: 'Investigación UX',
  PROYECTO_INTERNO: 'Proyecto interno',
  SERVICIO: 'Servicio',
  PROCESO: 'Rediseño de proceso',
  OTRO: 'Otro',
};

const ETAPA_LABELS: Record<string, string> = {
  IDEA: 'Idea (concepto sin validar)',
  EXPLORACION: 'Exploración (investigando el problema)',
  VALIDACION: 'Validación (probando la solución)',
  DESARROLLO: 'Desarrollo (construyendo)',
  LANZAMIENTO: 'Lanzamiento (saliendo al mercado)',
  CRECIMIENTO: 'Crecimiento (escalando)',
  MADUREZ: 'Madurez (operación estable)',
};

@Injectable()
export class ProjectBriefChatService {
  constructor(private readonly aiService: AiService) {}

  async execute(dto: ProjectBriefChatReqDto): Promise<ProjectBriefChatResDto> {
    const systemPrompt = this.buildSystemPrompt(dto.projectContext);

    const messages: AiMessage[] = [
      ...dto.history,
      { role: 'user', content: dto.userMessage },
    ];

    const assistantMessage = await this.aiService.chat(
      messages,
      systemPrompt,
      512,
    );
    const turnCount = Math.floor(dto.history.length / 2) + 1;

    return { assistantMessage, turnCount };
  }

  private buildSystemPrompt(
    ctx: ProjectBriefChatReqDto['projectContext'],
  ): string {
    const tipo = ctx.tipo ? (TIPO_LABELS[ctx.tipo] ?? ctx.tipo) : null;
    const etapa = ctx.etapa ? (ETAPA_LABELS[ctx.etapa] ?? ctx.etapa) : null;

    const contextLines: string[] = [`- Nombre: ${ctx.nombre}`];
    if (tipo) contextLines.push(`- Tipo: ${tipo}`);
    if (etapa) contextLines.push(`- Etapa: ${etapa}`);
    if (ctx.sector) contextLines.push(`- Sector: ${ctx.sector}`);

    return `Sos un consultor estratégico que ayuda a equipos a definir el contexto de su proyecto para que herramientas de análisis (FODA, Business Model Canvas, etc.) sean más precisas y útiles.

INFORMACIÓN DEL PROYECTO:
${contextLines.join('\n')}

TU ROL:
- Hacés UNA sola pregunta por turno para entender el proyecto en profundidad.
- El objetivo es cubrir: (1) el problema principal, (2) la audiencia objetivo, (3) el objetivo estratégico, (4) el diferenciador o propuesta de valor.
- Adaptás las preguntas al tipo y etapa del proyecto: para una idea en exploración preguntás sobre hipótesis; para un producto en crecimiento preguntás sobre diferenciación y escala.
- Tus preguntas son cortas, directas y específicas — sin preámbulos.
- Nunca hacés varias preguntas a la vez.
- Respondés en español.
- Tu respuesta es únicamente la pregunta, sin saludos ni texto adicional.`;
  }
}
