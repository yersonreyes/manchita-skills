import { Injectable, Inject, BadRequestException, UnprocessableEntityException, NotFoundException } from '@nestjs/common';
import { AI_PROVIDER } from './constants/ai.constants';
import { IAiProvider, AiMessage } from './providers/ai-provider.interface';
import { AiChatRequestDto, AiAnalyzeRequestDto } from './dto/ai.req.dto';
import { AiChatResDto, AiAnalyzeResDto } from './dto/ai.res.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiService {
  constructor(
    @Inject(AI_PROVIDER) private readonly provider: IAiProvider,
    private readonly prisma: PrismaService,
  ) {}

  async chat(dto: AiChatRequestDto): Promise<AiChatResDto> {
    console.log('[AiService:chat] Incoming request - toolAppId:', dto.toolApplicationId, 'userMessage length:', dto.userMessage.length, 'history length:', dto.history.length);

    this.validateHistory(dto.history);

    const tool = await this.loadToolForApplication(dto.toolApplicationId);
    const systemPrompt = this.buildQuestioner(tool);

    const messages: AiMessage[] = [
      ...dto.history,
      { role: 'user', content: dto.userMessage },
    ];

    console.log('[AiService:chat] Calling provider with', messages.length, 'messages');
    const assistantMessage = await this.provider.chat(messages, systemPrompt, 512);
    console.log('[AiService:chat] Provider returned message length:', assistantMessage.length, 'content:', assistantMessage.substring(0, 100));

    const turnCount = Math.floor(dto.history.length / 2) + 1;

    return { assistantMessage, turnCount };
  }

  async analyze(dto: AiAnalyzeRequestDto): Promise<AiAnalyzeResDto> {
    this.validateHistory(dto.history);

    const tool = await this.loadToolForApplication(dto.toolApplicationId);
    const systemPrompt = this.buildAnalyzer(tool);

    const transcript = dto.history
      .map((m) => `${m.role === 'user' ? 'Usuario' : 'Facilitador IA'}: ${m.content}`)
      .join('\n\n');

    const raw = await this.provider.chat(
      [{ role: 'user', content: `Aquí está la conversación completa para analizar:\n\n${transcript}\n\nGenerá el análisis en JSON ahora.` }],
      systemPrompt,
      1024,
    );

    let analysis;
    try {
      analysis = JSON.parse(this.extractJson(raw));
    } catch {
      throw new UnprocessableEntityException('La respuesta del AI no es JSON válido');
    }

    return { analysis };
  }

  private buildQuestioner(tool: { nombre: string; descripcion: string; comoSeUsa: string | null }): string {
    return `Sos un facilitador experto en Design Thinking aplicando la técnica "${tool.nombre}".

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}

TU ROL:
- Actuás exclusivamente como questioner: hacés UNA sola pregunta por turno.
- Tu objetivo es profundizar el análisis del usuario con preguntas que comiencen con "¿Por qué...?", "¿Qué origina...?" o similar, según corresponda a la técnica.
- Nunca das la respuesta al usuario. Nunca resolvés el problema por él.
- Mantenés el contexto del hilo de conversación para que cada pregunta sea más específica que la anterior.
- Tu tono es profesional, curioso y empático.
- Respondés siempre en español.
- Tu respuesta es únicamente la pregunta, sin saludos, prefacios ni conclusiones.`;
  }

  private buildAnalyzer(tool: { nombre: string; descripcion: string; comoSeUsa: string | null }): string {
    return `Sos un analista experto en Design Thinking. Has facilitado una sesión de "${tool.nombre}" con un equipo.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}

TU TAREA:
Analizá la conversación completa que se te proporciona y producí un análisis estructurado en JSON con EXACTAMENTE este formato:

{
  "summary": "párrafo de 2-3 oraciones que sintetiza la conversación",
  "rootCause": "la causa raíz identificada, formulada en una oración clara",
  "insights": ["insight 1", "insight 2", "insight 3"],
  "recommendations": ["recomendación accionable 1", "recomendación accionable 2"]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto adicional antes ni después.
- Los insights son observaciones derivadas de las respuestas del usuario.
- Las recomendaciones son acciones concretas para abordar la causa raíz.
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

  private validateHistory(history: AiMessage[]): void {
    if (history.length > 40) {
      throw new BadRequestException('Historial demasiado largo — máximo 40 mensajes');
    }
  }

  private async loadToolForApplication(toolApplicationId: number): Promise<any> {
    const app = await this.prisma.toolApplication.findUnique({
      where: { id: toolApplicationId },
      include: { tool: true },
    });

    if (!app) {
      throw new NotFoundException('Tool application no encontrada');
    }

    return app.tool;
  }
}
