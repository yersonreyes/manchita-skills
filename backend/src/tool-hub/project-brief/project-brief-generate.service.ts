import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { AiService } from '../../ai/ai.service';
import { ProjectBriefGenerateReqDto } from './dto/project-brief.req.dto';
import { ProjectBriefGenerateResDto } from './dto/project-brief.res.dto';

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
export class ProjectBriefGenerateService {
  constructor(private readonly aiService: AiService) {}

  async execute(
    dto: ProjectBriefGenerateReqDto,
  ): Promise<ProjectBriefGenerateResDto> {
    const systemPrompt = this.buildSystemPrompt(dto.projectContext);

    const transcript = dto.history
      .map(
        (m) =>
          `${m.role === 'user' ? 'Usuario' : 'Consultor IA'}: ${m.content}`,
      )
      .join('\n\n');

    const raw = await this.aiService.chat(
      [
        {
          role: 'user',
          content: `Aquí está la conversación:\n\n${transcript}\n\nGenerá el contexto del proyecto ahora.`,
        },
      ],
      systemPrompt,
      512,
    );

    const contexto = raw.trim();
    if (!contexto) {
      throw new UnprocessableEntityException('No se pudo generar el contexto');
    }

    return { contexto };
  }

  private buildSystemPrompt(
    ctx: ProjectBriefGenerateReqDto['projectContext'],
  ): string {
    const tipo = ctx.tipo ? (TIPO_LABELS[ctx.tipo] ?? ctx.tipo) : null;
    const etapa = ctx.etapa ? (ETAPA_LABELS[ctx.etapa] ?? ctx.etapa) : null;

    const contextLines: string[] = [`- Nombre: ${ctx.nombre}`];
    if (tipo) contextLines.push(`- Tipo: ${tipo}`);
    if (etapa) contextLines.push(`- Etapa: ${etapa}`);
    if (ctx.sector) contextLines.push(`- Sector: ${ctx.sector}`);

    return `Sos un experto en síntesis estratégica. A partir de una conversación de descubrimiento, generás el contexto del proyecto.

INFORMACIÓN DEL PROYECTO:
${contextLines.join('\n')}

TU TAREA:
Analizá la conversación y generá UN SOLO párrafo de 3-5 oraciones que capture:
- El problema o necesidad que aborda el proyecto
- La audiencia objetivo
- El objetivo principal
- El diferenciador o propuesta de valor (si fue mencionado)

REGLAS:
- Respondés ÚNICAMENTE con el párrafo, sin título, encabezado ni formato extra.
- Escribís en tercera persona, hablando del proyecto.
- El tono es claro, directo y profesional.
- Si algún punto no fue cubierto en la conversación, omitilo.
- Respondés en español.`;
  }
}
