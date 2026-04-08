import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import {
  MapaEvolucionInnovacionAnalyzeReqDto,
  EraEvolucionDto,
} from './dto/mapa-evolucion-innovacion-analyze.req.dto';
import {
  MapaEvolucionInnovacionAnalyzeResDto,
  MapaEvolucionReportDto,
} from './dto/mapa-evolucion-innovacion-analyze.res.dto';
import {
  buildProjectContextSection,
  ProjectBriefContext,
} from '../shared/project-context';

const TIPO_LABELS: Record<string, string> = {
  incremental: 'Incremental',
  disruptiva: 'Disruptiva',
  arquitectural: 'Arquitectural',
  radical: 'Radical',
};

@Injectable()
export class MapaEvolucionInnovacionAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(
    dto: MapaEvolucionInnovacionAnalyzeReqDto,
  ): Promise<MapaEvolucionInnovacionAnalyzeResDto> {
    const { tool, project } = await this.loadContext(dto.toolApplicationId);
    const systemPrompt = this.buildSystemPrompt(tool, project);
    const dataText = this.formatData(dto);

    const raw = await this.aiService.chat(
      [
        {
          role: 'user',
          content: `${dataText}\n\nGenerá el análisis en JSON ahora.`,
        },
      ],
      systemPrompt,
      2048,
    );

    let report: MapaEvolucionReportDto;
    try {
      report = JSON.parse(this.extractJson(raw)) as MapaEvolucionReportDto;
    } catch {
      console.error(
        '[MapaEvolucionInnovacionAnalyzeService] Raw AI response:',
        raw,
      );
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
    project: ProjectBriefContext,
  ): string {
    const projectSection = buildProjectContextSection(project);

    return `Sos un experto en innovación, historia de la tecnología y análisis de evolución de industrias. Conocés en profundidad los patrones de disrupción tecnológica, los ciclos de innovación y cómo identificar oportunidades en el espacio entre lo que existió y lo que viene.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá el mapa de evolución e innovación documentado y generá un análisis estratégico en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 3-4 oraciones: qué industria o espacio se analizó, cuántas eras se mapearon, cuál fue el patrón dominante de innovación a lo largo de la historia, y cuál es la oportunidad más relevante que emerge del análisis.",
  "analisisPorEra": [
    {
      "era": "Nombre de la era",
      "periodo": "Período temporal",
      "patronInnovacion": "Qué tipo de innovación dominó esta era y por qué — incremental, disruptiva, radical, arquitectural",
      "relevanciaActual": "Qué aprendizaje o legado deja esta era para el presente y futuro del espacio"
    }
  ],
  "patronesEvolutivos": [
    "Patrón que se repite a lo largo de múltiples eras — algo que caracteriza cómo evoluciona este espacio",
    "Segundo patrón sobre los ciclos de adopción o resistencia al cambio en este industria",
    "Tercer patrón relevante sobre cómo la innovación se acelera o desacelera"
  ],
  "puntosInflexionCriticos": [
    "El punto de inflexión más importante de toda la historia mapeada — qué lo hizo tan significativo",
    "Segundo punto de inflexión con impacto en el estado actual del espacio",
    "Tercer punto de inflexión que anticipa cómo podría ocurrir el próximo cambio"
  ],
  "gapsIdentificados": [
    "Gap entre lo que existió y lo que el mercado necesita pero nadie ha resuelto bien",
    "Segundo gap entre las tendencias emergentes y las soluciones actuales",
    "Tercer gap identificado en el análisis histórico"
  ],
  "oportunidadesDeInnovacion": [
    "Oportunidad concreta de innovación derivada del análisis de evolución — fundamentada en los gaps y patrones históricos",
    "Segunda oportunidad con tipo de innovación recomendado (incremental/disruptiva/radical) y por qué",
    "Tercera oportunidad prioritaria con contexto de timing — por qué es el momento correcto"
  ],
  "recommendations": [
    "Recomendación estratégica sobre cómo posicionarse aprovechando el análisis histórico",
    "Recomendación sobre qué no repetir — errores del pasado que el equipo debería evitar",
    "Recomendación sobre cómo usar el mapa de evolución para comunicar la visión del producto al equipo"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- El análisis por era debe cubrir TODAS las eras mapeadas.
- Los gaps son el corazón del análisis — son los espacios vacíos que la historia revela.
- Las oportunidades de innovación deben estar fundamentadas en evidencia de las eras previas, no en especulación.
- Mínimo 3 patronesEvolutivos, 3 puntosInflexionCriticos, 3 gapsIdentificados, 3 oportunidadesDeInnovacion, 3 recommendations.`;
  }

  private formatData(dto: MapaEvolucionInnovacionAnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== MAPA DE EVOLUCIÓN E INNOVACIÓN ==='];

    if (data.industria) lines.push(`Industria / Producto: ${data.industria}`);
    if (data.contexto) lines.push(`Contexto: ${data.contexto}`);
    lines.push(`Total de eras mapeadas: ${data.eras.length}`);

    for (let i = 0; i < data.eras.length; i++) {
      const era: EraEvolucionDto = data.eras[i];
      lines.push(
        `\n--- ERA ${i + 1}: ${era.nombre}${era.periodo ? ` (${era.periodo})` : ''} ---`,
      );

      if (era.hitos?.length) {
        lines.push(`Hitos (${era.hitos.length}):`);
        era.hitos.forEach((h) => {
          const tipo = TIPO_LABELS[h.tipoInnovacion] ?? h.tipoInnovacion;
          lines.push(`  • [${tipo}] ${h.descripcion}`);
        });
      }

      if (era.puntosInflexion?.length) {
        lines.push(`Puntos de inflexión:`);
        era.puntosInflexion.forEach((p) => lines.push(`  ⚡ ${p}`));
      }

      if (era.oportunidades?.length) {
        lines.push(`Oportunidades / Gaps identificados:`);
        era.oportunidades.forEach((o) => lines.push(`  💡 ${o}`));
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
    return { tool: app.tool, project: app.projectPhase.project };
  }
}
