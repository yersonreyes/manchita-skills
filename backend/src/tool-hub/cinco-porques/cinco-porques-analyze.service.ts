import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { CincoPorquesAnalyzeReqDto } from './dto/cinco-porques.req.dto';
import { CincoPorquesAnalyzeResDto } from './dto/cinco-porques.res.dto';

@Injectable()
export class CincoPorquesAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(dto: CincoPorquesAnalyzeReqDto): Promise<CincoPorquesAnalyzeResDto> {
    const tool = await this.loadTool(dto.toolApplicationId);
    const systemPrompt = this.buildSystemPrompt(tool);

    const transcript = dto.history
      .map((m) => `${m.role === 'user' ? 'Usuario' : 'Facilitador IA'}: ${m.content}`)
      .join('\n\n');

    const raw = await this.aiService.chat(
      [{ role: 'user', content: `Aquí está la conversación completa para analizar:\n\n${transcript}\n\nGenerá el análisis en JSON ahora.` }],
      systemPrompt,
      1024,
    );

    let analysis: CincoPorquesAnalyzeResDto['analysis'];
    try {
      analysis = JSON.parse(this.extractJson(raw));
    } catch {
      throw new UnprocessableEntityException('La respuesta del AI no es JSON válido');
    }

    return { analysis };
  }

  private buildSystemPrompt(tool: { nombre: string; descripcion: string; comoSeUsa: string | null }): string {
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

  private async loadTool(toolApplicationId: number) {
    const app = await this.prisma.toolApplication.findUnique({
      where: { id: toolApplicationId },
      include: { tool: true },
    });

    if (!app) throw new NotFoundException('Tool application no encontrada');

    return app.tool;
  }
}
