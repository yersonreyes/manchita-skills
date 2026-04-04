import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { MatrizHipotesisAnalyzeReqDto } from './dto/matriz-hipotesis-analyze.req.dto';
import { MatrizHipotesisAnalyzeResDto, MatrizHipotesisReportDto } from './dto/matriz-hipotesis-analyze.res.dto';
import { buildProjectContextSection, ProjectBriefContext } from '../shared/project-context';

const IMPACTO_LABELS: Record<string, string> = {
  alto: 'Alto impacto',
  bajo: 'Bajo impacto',
};

const INCERTIDUMBRE_LABELS: Record<string, string> = {
  alta: 'Alta incertidumbre',
  baja: 'Baja incertidumbre',
};

function getCuadrante(impacto: string, incertidumbre: string): string {
  if (impacto === 'alto' && incertidumbre === 'alta') return 'PRIORITY 🏆';
  if (impacto === 'alto' && incertidumbre === 'baja') return 'LATER';
  if (impacto === 'bajo' && incertidumbre === 'alta') return 'DROP';
  return 'OPTIONAL';
}

@Injectable()
export class MatrizHipotesisAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(dto: MatrizHipotesisAnalyzeReqDto): Promise<MatrizHipotesisAnalyzeResDto> {
    const { tool, project } = await this.loadContext(dto.toolApplicationId);
    const systemPrompt = this.buildSystemPrompt(tool, project);
    const dataText = this.formatData(dto);

    const raw = await this.aiService.chat(
      [{ role: 'user', content: `${dataText}\n\nGenerá el análisis en JSON ahora.` }],
      systemPrompt,
      2048,
    );

    let report: MatrizHipotesisReportDto;
    try {
      report = JSON.parse(this.extractJson(raw)) as MatrizHipotesisReportDto;
    } catch {
      console.error('[MatrizHipotesisAnalyzeService] Raw AI response:', raw);
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

    return `Sos un experto en Design Thinking, Lean Startup y gestión de riesgo en proyectos de innovación. Tu especialidad es analizar matrices de hipótesis: evaluar si las hipótesis están bien formuladas (¿tienen estructura Si/Entonces/Porque?), identificar cuáles representan el mayor riesgo para el proyecto si resultan falsas, recomendar el orden óptimo de validación según impacto e incertidumbre, y sugerir experimentos que generen aprendizaje rápido con el menor costo posible.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá la Matriz de Hipótesis documentada y generá un análisis estratégico en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 2-3 oraciones: cuántas hipótesis se documentaron, cuántas están en el cuadrante PRIORITY, y cuál es la principal recomendación del análisis.",
  "prioridadValidacion": "Evaluación del orden de validación propuesto: ¿las hipótesis PRIORITY son realmente las más críticas? ¿hay alguna hipótesis que debería subir en prioridad? ¿el equipo está alineado en qué significa 'alto impacto' para este proyecto?",
  "hipotesisCriticas": [
    "Análisis de la hipótesis más crítica — por qué es la más importante y qué pasa si resulta falsa",
    "Segunda hipótesis crítica con su análisis de riesgo",
    "Más si corresponde"
  ],
  "experimentosRecomendados": [
    "Experimento concreto para la hipótesis PRIORITY más importante — método, duración, métricas de éxito",
    "Experimento alternativo más rápido/barato para generar aprendizaje sin esperar el experimento principal",
    "Más si corresponde"
  ],
  "riesgosIdentificados": [
    "Riesgo concreto — qué pasa si la hipótesis más crítica resulta falsa y el equipo no lo validó a tiempo",
    "Riesgo de sesgo de confirmación — qué hipótesis puede estar mal formulada o tiene asunciones implícitas no declaradas",
    "Más riesgos si los hay"
  ],
  "recommendations": [
    "Primera acción concreta — qué hacer esta semana para comenzar la validación de la hipótesis PRIORITY más crítica",
    "Cómo estructurar mejor una hipótesis que está mal formulada (sin estructura Si/Entonces/Porque)",
    "Qué hacer con las hipótesis DROP — por qué no descartarlas del todo sino documentar la razón"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- Una hipótesis PRIORITY mal formulada (sin estructura clara) es un riesgo — señalalo.
- Si todas las hipótesis están en PRIORITY, el equipo probablemente está sobreestimando la incertidumbre — señalalo.
- Mínimo 2 hipótesisCriticas, 2 experimentosRecomendados, 2 riesgosIdentificados, 3 recommendations.`;
  }

  private formatData(dto: MatrizHipotesisAnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== MATRIZ DE HIPÓTESIS ==='];

    if (data.contexto) lines.push(`\nCONTEXTO:\n"${data.contexto}"`);

    const hipotesisPorCuadrante: Record<string, typeof data.hipotesis> = {
      'PRIORITY 🏆': [],
      'LATER': [],
      'DROP': [],
      'OPTIONAL': [],
    };

    for (const h of data.hipotesis) {
      const cuad = getCuadrante(h.impacto, h.incertidumbre);
      hipotesisPorCuadrante[cuad].push(h);
    }

    lines.push(`\nTOTAL: ${data.hipotesis.length} hipótesis`);

    for (const [cuadrante, hipotesis] of Object.entries(hipotesisPorCuadrante)) {
      if (hipotesis.length === 0) continue;
      lines.push(`\n--- ${cuadrante} (${hipotesis.length}) ---`);
      hipotesis.forEach((h, i) => {
        const imp = IMPACTO_LABELS[h.impacto] ?? h.impacto;
        const inc = INCERTIDUMBRE_LABELS[h.incertidumbre] ?? h.incertidumbre;
        lines.push(`\n  ${i + 1}. Formulación: "${h.formulacion || '(sin formulación)'}"`);
        lines.push(`     ${imp} | ${inc}`);
        if (h.experimento) lines.push(`     Experimento: "${h.experimento}"`);
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
