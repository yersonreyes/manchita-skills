import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { MatrizTendenciasAnalyzeReqDto, TendenciaDto } from './dto/matriz-tendencias-analyze.req.dto';
import { MatrizTendenciasAnalyzeResDto, MatrizTendenciasReportDto } from './dto/matriz-tendencias-analyze.res.dto';
import { buildProjectContextSection, ProjectBriefContext } from '../shared/project-context';

const CATEGORIA_LABELS: Record<string, string> = {
  tecnologica: 'Tecnológica',
  social: 'Social',
  economica: 'Económica',
  regulatoria: 'Regulatoria',
  mercado: 'Mercado',
};

const CUADRANTE_LABELS: Record<string, Record<string, string>> = {
  alto: { corto: 'AHORA (Priorizar)', largo: 'FUTURO (Invertir)' },
  bajo: { corto: 'IGNORAR (No priorizar)', largo: 'MONITOREAR (Vigilar)' },
};

@Injectable()
export class MatrizTendenciasAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(dto: MatrizTendenciasAnalyzeReqDto): Promise<MatrizTendenciasAnalyzeResDto> {
    const { tool, project } = await this.loadContext(dto.toolApplicationId);
    const systemPrompt = this.buildSystemPrompt(tool, project);
    const dataText = this.formatData(dto);

    const raw = await this.aiService.chat(
      [{ role: 'user', content: `${dataText}\n\nGenerá el análisis en JSON ahora.` }],
      systemPrompt,
      2048,
    );

    let report: MatrizTendenciasReportDto;
    try {
      report = JSON.parse(this.extractJson(raw)) as MatrizTendenciasReportDto;
    } catch {
      console.error('[MatrizTendenciasAnalyzeService] Raw AI response:', raw);
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

    return `Sos un experto en análisis estratégico, prospectiva y tendencias de mercado aplicadas al diseño de productos y servicios.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá las tendencias clasificadas en la Matriz de Tendencias y generá un análisis estratégico en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 3-4 oraciones: cuántas tendencias se identificaron, cuántas por cuadrante, cuál es el patrón general del panorama estratégico y cuál es la prioridad más urgente que emerge del análisis.",
  "analisisPorCuadrante": [
    {
      "cuadrante": "AHORA",
      "tendencias": ["nombre de cada tendencia en este cuadrante"],
      "estrategia": "Qué hacer concretamente con las tendencias de este cuadrante — acciones, inversiones, adaptaciones urgentes"
    },
    {
      "cuadrante": "FUTURO",
      "tendencias": ["nombre de cada tendencia en este cuadrante"],
      "estrategia": "Cómo prepararse estratégicamente para estas tendencias de alto impacto a largo plazo"
    },
    {
      "cuadrante": "MONITOREAR",
      "tendencias": ["nombre de cada tendencia en este cuadrante"],
      "estrategia": "Cómo y con qué frecuencia hacer seguimiento de estas tendencias emergentes"
    },
    {
      "cuadrante": "IGNORAR",
      "tendencias": ["nombre de cada tendencia en este cuadrante"],
      "estrategia": "Por qué no priorizar estas tendencias y bajo qué condiciones revisarlas"
    }
  ],
  "tendenciasClaves": [
    "La tendencia más importante con argumento de por qué es crítica para el proyecto — impacto, urgencia y qué cambia",
    "Segunda tendencia clave con su relación con otras tendencias en el panorama",
    "Tercera tendencia destacada"
  ],
  "insightsEstrategicos": [
    "Insight que emerge de analizar el conjunto de tendencias — algo que no se ve mirando cada una por separado",
    "Segundo insight sobre cómo la combinación de tendencias crea oportunidades o riesgos únicos",
    "Tercer insight estratégico relevante para las decisiones de diseño o producto"
  ],
  "riesgosIdentificados": [
    "Riesgo concreto que representa una tendencia del cuadrante AHORA si no se actúa",
    "Riesgo de quedarse atrás si no se invierte en las tendencias del cuadrante FUTURO",
    "Tercer riesgo estratégico con timeframe estimado"
  ],
  "oportunidades": [
    "Oportunidad concreta de diseño o producto derivada del análisis de tendencias",
    "Segunda oportunidad, especificando qué tendencias la hacen viable",
    "Tercera oportunidad priorizada"
  ],
  "recommendations": [
    "Recomendación accionable inmediata (próximos 3 meses) basada en tendencias AHORA",
    "Recomendación de mediano plazo para prepararse ante tendencias FUTURO",
    "Recomendación estratégica sobre cómo incorporar el análisis de tendencias al proceso de diseño del equipo"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- Solo incluí cuadrantes que tengan tendencias en analisisPorCuadrante — omití los cuadrantes vacíos.
- Los insights estratégicos son el corazón del análisis — son lo que emerge de ver el CONJUNTO, no tendencia por tendencia.
- Mínimo 3 tendenciasClaves, 3 insightsEstrategicos, 3 riesgosIdentificados, 2 oportunidades, 3 recommendations.`;
  }

  private formatData(dto: MatrizTendenciasAnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== MATRIZ DE TENDENCIAS ==='];

    if (data.contexto) lines.push(`Contexto: ${data.contexto}`);
    lines.push(`Total de tendencias: ${data.tendencias.length}`);

    const cuadrantes: Array<{ label: string; impacto: string; plazo: string }> = [
      { label: 'AHORA (Alto impacto + Corto plazo)', impacto: 'alto', plazo: 'corto' },
      { label: 'FUTURO (Alto impacto + Largo plazo)', impacto: 'alto', plazo: 'largo' },
      { label: 'IGNORAR (Bajo impacto + Corto plazo)', impacto: 'bajo', plazo: 'corto' },
      { label: 'MONITOREAR (Bajo impacto + Largo plazo)', impacto: 'bajo', plazo: 'largo' },
    ];

    for (const cuadrante of cuadrantes) {
      const tendencias = data.tendencias.filter(
        (t: TendenciaDto) => t.impacto === cuadrante.impacto && t.plazo === cuadrante.plazo,
      );
      if (tendencias.length > 0) {
        lines.push(`\n--- ${cuadrante.label} ---`);
        for (const t of tendencias) {
          const catLabel = CATEGORIA_LABELS[t.categoria] ?? t.categoria;
          lines.push(`  • [${catLabel}] ${t.nombre}${t.descripcion ? ` — ${t.descripcion}` : ''}`);
        }
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
