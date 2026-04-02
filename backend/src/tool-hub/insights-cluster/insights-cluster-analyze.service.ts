import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { InsightsClusterAnalyzeReqDto, InsightClusterDto } from './dto/insights-cluster-analyze.req.dto';
import { InsightsClusterAnalyzeResDto, InsightsClusterReportDto } from './dto/insights-cluster-analyze.res.dto';
import { buildProjectContextSection, ProjectBriefContext } from '../shared/project-context';

const IMPACTO_LABELS: Record<string, string> = {
  alto: 'Alto',
  medio: 'Medio',
  bajo: 'Bajo',
};

@Injectable()
export class InsightsClusterAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(dto: InsightsClusterAnalyzeReqDto): Promise<InsightsClusterAnalyzeResDto> {
    const { tool, project } = await this.loadContext(dto.toolApplicationId);
    const systemPrompt = this.buildSystemPrompt(tool, project);
    const dataText = this.formatData(dto);

    const raw = await this.aiService.chat(
      [{ role: 'user', content: `${dataText}\n\nGenerá el análisis en JSON ahora.` }],
      systemPrompt,
      2048,
    );

    let report: InsightsClusterReportDto;
    try {
      report = JSON.parse(this.extractJson(raw)) as InsightsClusterReportDto;
    } catch {
      console.error('[InsightsClusterAnalyzeService] Raw AI response:', raw);
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

    return `Sos un experto en síntesis de investigación cualitativa, análisis temático y Design Thinking. Conocés en profundidad cómo identificar patrones entre clusters de insights, cómo priorizar temáticas según impacto en el usuario, y cómo traducir agrupaciones de datos cualitativos en oportunidades estratégicas de diseño.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá los clusters de insights documentados y generá un análisis estratégico en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 3-4 oraciones: qué investigación produjo estos clusters, cuántos clusters y cuántos insights se mapearon, cuál es el tema dominante que cruza la mayoría de los clusters, y cuál es la oportunidad de diseño más urgente que emerge.",
  "analisisPorCluster": [
    {
      "cluster": "Nombre del cluster",
      "insightsClave": ["El insight más representativo de este cluster", "Segundo insight clave de este grupo"],
      "patron": "El patrón unificador de este cluster — qué tienen en común todos sus insights",
      "implicacion": "Qué debería hacer el equipo de diseño con este cluster específico"
    }
  ],
  "clusterPrioritario": "El cluster que debería abordarse primero — su nombre, por qué tiene mayor impacto potencial y qué tipo de intervención requiere",
  "patronesGlobales": [
    "Patrón que se repite en múltiples clusters — un tema transversal",
    "Segundo patrón global sobre el comportamiento o necesidad del usuario",
    "Tercer patrón que conecta clusters aparentemente distintos"
  ],
  "tensionesEntreGrupos": [
    "Tensión entre dos clusters — insights que apuntan a necesidades contradictorias",
    "Segunda tensión que el equipo debe resolver explícitamente en el diseño",
    "Tercera contradicción o trade-off que emerge del conjunto de clusters"
  ],
  "oportunidadesPrioritarias": [
    "Oportunidad concreta de diseño derivada del análisis de clusters — accionable y específica",
    "Segunda oportunidad con tipo de intervención recomendada",
    "Tercera oportunidad fundamentada en los patrones globales identificados"
  ],
  "recommendations": [
    "Acción concreta que el equipo debería tomar como primer paso basada en los clusters",
    "Recomendación sobre cómo usar estos clusters para priorizar el roadmap o backlog",
    "Recomendación sobre qué investigación adicional se necesita para cubrir gaps entre clusters"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- El analisisPorCluster debe cubrir TODOS los clusters provistos.
- El clusterPrioritario debe ser uno de los clusters reales, no uno inventado.
- Las tensionesEntreGrupos son obligatorias — si los clusters parecen alineados, buscá los trade-offs implícitos.
- Mínimo 3 patronesGlobales, 3 tensionesEntreGrupos, 3 oportunidadesPrioritarias, 3 recommendations.`;
  }

  private formatData(dto: InsightsClusterAnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== INSIGHTS CLUSTER ==='];

    if (data.contexto) lines.push(`Contexto: ${data.contexto}`);
    lines.push(`Total de clusters: ${data.clusters.length}`);
    const totalInsights = data.clusters.reduce((sum, c) => sum + c.insights.length, 0);
    lines.push(`Total de insights: ${totalInsights}`);

    for (let i = 0; i < data.clusters.length; i++) {
      const cluster: InsightClusterDto = data.clusters[i];
      lines.push(`\n--- CLUSTER ${i + 1}: ${cluster.nombre || '(Sin nombre)'} ---`);
      lines.push(`Insights (${cluster.insights.length}):`);
      cluster.insights.forEach(ins => {
        const impacto = IMPACTO_LABELS[ins.impacto] ?? ins.impacto;
        lines.push(`  [${impacto}] ${ins.texto}`);
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
