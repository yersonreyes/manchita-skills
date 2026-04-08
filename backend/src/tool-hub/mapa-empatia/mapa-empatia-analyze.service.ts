import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import {
  MapaEmpatiaAnalyzeReqDto,
  MapaEmpatiaDataDto,
} from './dto/mapa-empatia-analyze.req.dto';
import {
  MapaEmpatiaAnalyzeResDto,
  MapaEmpatiaReportDto,
} from './dto/mapa-empatia-analyze.res.dto';

@Injectable()
export class MapaEmpatiaAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(
    dto: MapaEmpatiaAnalyzeReqDto,
  ): Promise<MapaEmpatiaAnalyzeResDto> {
    const { tool, projectNombre } = await this.loadContext(
      dto.toolApplicationId,
    );
    const systemPrompt = this.buildSystemPrompt(tool, projectNombre);
    const dataText = this.formatData(dto.data);

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

    let report: MapaEmpatiaReportDto;
    try {
      report = JSON.parse(this.extractJson(raw)) as MapaEmpatiaReportDto;
    } catch {
      console.error('[MapaEmpatiaAnalyzeService] Raw AI response:', raw);
      throw new UnprocessableEntityException(
        'La respuesta del AI no es JSON válido',
      );
    }

    return {
      version: dto.currentVersion + 1,
      generatedAt: new Date().toISOString(),
      report,
    };
  }

  private buildSystemPrompt(
    tool: { nombre: string; descripcion: string; comoSeUsa: string | null },
    projectNombre: string,
  ): string {
    return `Sos un experto en UX Research y Design Thinking, especializado en análisis de Mapas de Empatía.

HERRAMIENTA: ${tool.nombre}
${tool.descripcion}
${tool.comoSeUsa ? `\nCómo se usa: ${tool.comoSeUsa}` : ''}

PROYECTO: ${projectNombre}

TU TAREA:
Analizá el Mapa de Empatía proporcionado y generá un informe en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis en 3-4 oraciones del perfil empático del usuario: quién es, qué lo define emocionalmente y cuáles son sus principales tensiones.",
  "tensionesClaves": [
    "Tensión entre lo que DICE y lo que HACE: ejemplo concreto del mapa",
    "Tensión entre lo que PIENSA y lo que SIENTE: ejemplo concreto"
  ],
  "insightsDeDiseno": [
    "Insight 1: observación no obvia que guía una decisión de diseño",
    "Insight 2: patrón detectado en el comportamiento o emoción del usuario"
  ],
  "oportunidades": [
    "Oportunidad 1: área donde el diseño puede reducir fricción o tensión",
    "Oportunidad 2: necesidad no articulada que el usuario no expresa directamente"
  ],
  "recommendations": [
    "Acción concreta de diseño 1 basada en el análisis",
    "Acción concreta de diseño 2",
    "Acción concreta de diseño 3"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- Las "tensionesClaves" son la diferencia entre lo que el usuario DICE vs. lo que HACE, o lo que PIENSA vs. SIENTE. Son el insight más poderoso del mapa.
- Los "insightsDeDiseno" deben ser observaciones no obvias, no repetir los datos del mapa.
- Si algún cuadrante está vacío, ignoralo en el análisis.
- Mínimo 2 items por sección, máximo 4.`;
  }

  private formatData(data: MapaEmpatiaDataDto): string {
    const lines: string[] = ['=== MAPA DE EMPATÍA ==='];

    if (data.usuario) lines.push(`\nUSUARIO: ${data.usuario}`);
    if (data.contexto) lines.push(`CONTEXTO: ${data.contexto}`);

    const quadrants: Array<{ label: string; items: string[] }> = [
      { label: 'VE', items: data.ve ?? [] },
      { label: 'OYE', items: data.oye ?? [] },
      { label: 'PIENSA', items: data.piensa ?? [] },
      { label: 'SIENTE', items: data.siente ?? [] },
      { label: 'DICE', items: data.dice ?? [] },
      { label: 'HACE', items: data.hace ?? [] },
    ];

    for (const q of quadrants) {
      if (q.items.length > 0) {
        lines.push(`\n--- ${q.label} ---`);
        q.items.forEach((item) => lines.push(`• ${item}`));
      }
    }

    return lines.join('\n');
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
    return {
      tool: app.tool,
      projectNombre: app.projectPhase.project.nombre,
    };
  }
}
