import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { BenchmarkingAnalyzeReqDto } from './dto/benchmarking-analyze.req.dto';
import {
  BenchmarkingAnalyzeResDto,
  BenchmarkingReportDto,
} from './dto/benchmarking-analyze.res.dto';
import { buildProjectContextSection, ProjectBriefContext } from '../shared/project-context';

@Injectable()
export class BenchmarkingAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(dto: BenchmarkingAnalyzeReqDto): Promise<BenchmarkingAnalyzeResDto> {
    const { tool, project } = await this.loadContext(dto.toolApplicationId);
    const systemPrompt = this.buildSystemPrompt(tool, project);
    const dataText = this.formatData(dto);

    const raw = await this.aiService.chat(
      [{ role: 'user', content: `${dataText}\n\nGenerá el análisis en JSON ahora.` }],
      systemPrompt,
      2048,
    );

    let report: BenchmarkingReportDto;
    try {
      report = JSON.parse(this.extractJson(raw)) as BenchmarkingReportDto;
    } catch {
      console.error('[BenchmarkingAnalyzeService] Raw AI response:', raw);
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

    return `Sos un experto en estrategia competitiva, UX y product management especializado en análisis de benchmarking.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá la matriz de benchmarking proporcionada y generá un análisis estratégico en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 3-4 oraciones: qué se comparó, cuál es la posición competitiva actual, y qué es lo más importante que emerge del análisis.",
  "posicionamiento": "Una oración describiendo el posicionamiento actual en el mercado respecto a los competidores analizados.",
  "brechas": [
    {
      "criterio": "Nombre del criterio analizado",
      "estado": "ventaja | paridad | brecha",
      "observacion": "Qué revela la comparación en este criterio, con datos concretos si están disponibles."
    }
  ],
  "ventajasCompetitivas": [
    "Área donde tu producto claramente supera o diferencia a los competidores",
    "Otra ventaja concreta con contexto de por qué es relevante"
  ],
  "amenazas": [
    "Área donde hay una brecha importante respecto a competidores",
    "Otra brecha con contexto de impacto en el negocio"
  ],
  "oportunidadesDeDiferenciacion": [
    "Espacio no cubierto por ningún competidor donde podrías diferenciarte",
    "Combinación de features/UX que ninguno tiene y que el mercado podría valorar"
  ],
  "recommendations": [
    "Acción estratégica concreta 1 — con impacto esperado",
    "Acción estratégica concreta 2",
    "Acción estratégica concreta 3"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- El campo "estado" debe ser exactamente "ventaja", "paridad" o "brecha" (minúsculas, sin acentos).
- "ventaja": tu producto supera a la mayoría de competidores.
- "paridad": similar a los competidores, sin diferencia significativa.
- "brecha": los competidores superan a tu producto en este criterio.
- Si un criterio no tiene valores suficientes, usá tu criterio experto.
- Mínimo 2 items en ventajasCompetitivas, amenazas, oportunidadesDeDiferenciacion y recommendations.`;
  }

  private formatData(dto: BenchmarkingAnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== BENCHMARKING ==='];

    if (data.contexto) lines.push(`Contexto: ${data.contexto}`);
    if (data.miProducto) lines.push(`Mi Producto: ${data.miProducto}`);

    if (!data.criterios.length) return lines.join('\n');

    // Build comparison table
    const compNames = data.competidores.map(c => c.nombre || '(Sin nombre)');
    const header = ['Criterio', data.miProducto || 'Mi Producto', ...compNames];
    lines.push(`\n${header.join(' | ')}`);
    lines.push(header.map(() => '---').join(' | '));

    for (const criterio of data.criterios) {
      const miVal = data.miValores[criterio.id] || '—';
      const compVals = data.competidores.map(c => c.valores[criterio.id] || '—');
      const row = [criterio.nombre || '(Sin nombre)', miVal, ...compVals];
      lines.push(row.join(' | '));
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
