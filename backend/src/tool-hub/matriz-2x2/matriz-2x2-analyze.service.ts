import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { Matriz2x2AnalyzeReqDto, Matriz2x2ItemDto } from './dto/matriz-2x2-analyze.req.dto';
import { Matriz2x2AnalyzeResDto, Matriz2x2ReportDto } from './dto/matriz-2x2-analyze.res.dto';
import { buildProjectContextSection, ProjectBriefContext } from '../shared/project-context';

@Injectable()
export class Matriz2x2AnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(dto: Matriz2x2AnalyzeReqDto): Promise<Matriz2x2AnalyzeResDto> {
    const { tool, project } = await this.loadContext(dto.toolApplicationId);
    const systemPrompt = this.buildSystemPrompt(tool, project);
    const dataText = this.formatData(dto);

    const raw = await this.aiService.chat(
      [{ role: 'user', content: `${dataText}\n\nGenerá el análisis en JSON ahora.` }],
      systemPrompt,
      2048,
    );

    let report: Matriz2x2ReportDto;
    try {
      report = JSON.parse(this.extractJson(raw)) as Matriz2x2ReportDto;
    } catch {
      console.error('[Matriz2x2AnalyzeService] Raw AI response:', raw);
      throw new UnprocessableEntityException('La respuesta del AI no es JSON válido');
    }

    return {
      version: dto.currentVersion + 1,
      generatedAt: new Date().toISOString(),
      report,
    };
  }

  private buildSystemPrompt(
    tool: { nombre: string; descripcion: string; comoSeUsa: string | null },
    project: ProjectBriefContext,
  ): string {
    const projectSection = buildProjectContextSection(project);

    return `Sos un experto en priorización estratégica, gestión de producto y Design Thinking. Conocés en profundidad cómo usar matrices 2x2 para tomar decisiones, identificar patrones de distribución, y derivar recomendaciones accionables para equipos de producto y diseño.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá la matriz 2x2 provista y generá un análisis estratégico en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 3-4 oraciones: qué se está priorizando (contexto), cuántos ítems se mapearon, cómo está distribuida la carga entre los cuadrantes, y cuál es la recomendación más importante que emerge del análisis.",
  "distribucionPorCuadrante": [
    {
      "cuadrante": "Nombre descriptivo del cuadrante (ej: Alto Impacto / Bajo Esfuerzo)",
      "items": ["Ítem 1 en este cuadrante", "Ítem 2 en este cuadrante"],
      "interpretacion": "Qué significa tener estos ítems en este cuadrante y qué acción corresponde"
    }
  ],
  "itemsPrioritarios": [
    {
      "nombre": "Nombre del ítem más prioritario",
      "cuadrante": "Cuadrante donde está ubicado",
      "justificacion": "Por qué este ítem merece atención inmediata según su posición en la matriz"
    }
  ],
  "itemsAEvitar": [
    {
      "nombre": "Nombre del ítem a evitar o postergar",
      "cuadrante": "Cuadrante donde está ubicado",
      "justificacion": "Por qué este ítem no debería consumir recursos ahora"
    }
  ],
  "patronesIdentificados": [
    "Patrón sobre cómo están distribuidos los ítems — concentración en un cuadrante, dispersión, etc.",
    "Segundo patrón sobre las características comunes de los ítems en los cuadrantes prioritarios",
    "Tercer patrón estratégico que revela algo sobre las capacidades o restricciones del equipo"
  ],
  "oportunidades": [
    "Oportunidad de quick win identificada en la matriz — alto valor con poco esfuerzo",
    "Segunda oportunidad de inversión estratégica que vale el esfuerzo alto",
    "Tercera oportunidad derivada de los patrones de distribución"
  ],
  "recommendations": [
    "Acción concreta e inmediata basada en la distribución actual de la matriz",
    "Recomendación sobre qué cuadrante priorizar primero y por qué",
    "Recomendación sobre cómo comunicar estas prioridades al equipo o stakeholders"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- El distribucionPorCuadrante debe incluir solo los cuadrantes que tienen ítems.
- Los itemsPrioritarios son los que tienen mayor potencial de impacto.
- Los itemsAEvitar son los de bajo retorno — no es negativo, es una decisión estratégica.
- Mínimo 2 itemsPrioritarios, 1 itemsAEvitar, 3 patronesIdentificados, 3 oportunidades, 3 recommendations.`;
  }

  private formatData(dto: Matriz2x2AnalyzeReqDto): string {
    const { data } = dto;
    const ejeX = data.config?.ejeXNombre || 'Eje X';
    const ejeY = data.config?.ejeYNombre || 'Eje Y';

    const lines: string[] = ['=== MATRIZ 2×2 ==='];
    if (data.contexto) lines.push(`Contexto: ${data.contexto}`);
    lines.push(`Eje X: ${ejeX}`);
    lines.push(`Eje Y: ${ejeY}`);
    lines.push(`Total de ítems: ${data.items.length}`);

    const cuadrantes = [
      { ejeX: 'alto', ejeY: 'alto', label: `Alto ${ejeX} / Alto ${ejeY}` },
      { ejeX: 'bajo', ejeY: 'alto', label: `Bajo ${ejeX} / Alto ${ejeY}` },
      { ejeX: 'alto', ejeY: 'bajo', label: `Alto ${ejeX} / Bajo ${ejeY}` },
      { ejeX: 'bajo', ejeY: 'bajo', label: `Bajo ${ejeX} / Bajo ${ejeY}` },
    ];

    for (const c of cuadrantes) {
      const items = data.items.filter((i: Matriz2x2ItemDto) => i.ejeX === c.ejeX && i.ejeY === c.ejeY);
      if (!items.length) continue;
      lines.push(`\n--- CUADRANTE: ${c.label} ---`);
      items.forEach(i => {
        lines.push(`  • ${i.nombre}${i.descripcion ? ` — ${i.descripcion}` : ''}`);
      });
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
    return { tool: app.tool, project: app.projectPhase.project };
  }
}
