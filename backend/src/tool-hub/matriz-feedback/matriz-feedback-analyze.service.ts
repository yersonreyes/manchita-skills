import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { MatrizFeedbackAnalyzeReqDto } from './dto/matriz-feedback-analyze.req.dto';
import { MatrizFeedbackAnalyzeResDto, MatrizFeedbackReportDto } from './dto/matriz-feedback-analyze.res.dto';
import { buildProjectContextSection, ProjectBriefContext } from '../shared/project-context';

const FUENTE_LABELS: Record<string, string> = {
  testing:     'Testing de usabilidad',
  entrevista:  'Entrevista de usuario',
  analytics:   'Analytics / métricas',
  stakeholder: 'Revisión de stakeholders',
  soporte:     'Feedback de soporte',
  otro:        'Otra fuente',
};

const PRIORIDAD_LABELS: Record<string, string> = {
  urgente: '🔴 Urgente',
  normal:  '🟡 Normal',
  baja:    '⚪ Baja',
};

@Injectable()
export class MatrizFeedbackAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(dto: MatrizFeedbackAnalyzeReqDto): Promise<MatrizFeedbackAnalyzeResDto> {
    const { tool, project } = await this.loadContext(dto.toolApplicationId);
    const systemPrompt = this.buildSystemPrompt(tool, project);
    const dataText = this.formatData(dto);

    const raw = await this.aiService.chat(
      [{ role: 'user', content: `${dataText}\n\nGenerá el análisis en JSON ahora.` }],
      systemPrompt,
      2048,
    );

    let report: MatrizFeedbackReportDto;
    try {
      report = JSON.parse(this.extractJson(raw)) as MatrizFeedbackReportDto;
    } catch {
      console.error('[MatrizFeedbackAnalyzeService] Raw AI response:', raw);
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

    return `Sos un experto en UX research, gestión de feedback de usuarios y product management. Tu especialidad es analizar matrices de feedback: identificar patrones entre los distintos cuadrantes, distinguir señales importantes de ruido, evaluar la prioridad real de los issues según impacto en el usuario, y recomendar acciones concretas y secuenciadas para el equipo de diseño.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá la Matriz de Feedback documentada y generá un análisis estratégico en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 2-3 oraciones: cuántos items de feedback hay en total, cuáles son los cuadrantes más cargados y cuál es el estado general del diseño según este feedback.",
  "patronesIdentificados": "Descripción de los patrones transversales entre cuadrantes: ¿hay temas recurrentes? ¿El feedback positivo corrobora algo? ¿Los issues críticos tienen relación con los insights? ¿Hay coherencia entre fuentes?",
  "prioridadAcciones": [
    "Primera acción concreta y urgente — qué issue del cuadrante 'Arreglar' tiene mayor impacto y debe atacarse primero, y por qué",
    "Segunda acción — qué otras mejoras son prioritarias en orden de impacto",
    "Más acciones si corresponde"
  ],
  "insightsDestacados": [
    "Insight más valioso del cuadrante 'Nuevos Insights' — qué revela sobre el problema original y qué implicaciones tiene para el diseño",
    "Más insights si los hay"
  ],
  "feedbackAIgnorar": "Evaluación del cuadrante 'Evaluar / Ignorar': qué feedback realmente no es accionable ahora, por qué, y si algún item de ese cuadrante debería reconsiderarse.",
  "recommendations": [
    "Primera recomendación concreta: qué hacer esta semana para addressar el feedback más urgente",
    "Cómo documentar y comunicar el feedback positivo al equipo para reforzar las decisiones acertadas",
    "Cómo incorporar los nuevos insights al proceso de diseño sin scope creep"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- Si el cuadrante 'Arreglar' está vacío, señalalo como positivo.
- Si hay feedback urgente ignorado, señalalo como riesgo.
- Mínimo 2 prioridadAcciones, 1 insightDestacado, 3 recommendations.`;
  }

  private formatData(dto: MatrizFeedbackAnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== MATRIZ DE FEEDBACK ==='];

    if (data.contexto) lines.push(`\nCONTEXTO:\n"${data.contexto}"`);

    const cuadrantes = [
      { key: 'reforzar', label: '✅ REFORZAR (Sobre la solución · Positivo)', items: data.reforzar },
      { key: 'arreglar', label: '⚠️ ARREGLAR (Sobre la solución · Negativo)', items: data.arreglar },
      { key: 'insights', label: '💡 NUEVOS INSIGHTS (Sobre el problema · Positivo)', items: data.insights },
      { key: 'evaluar',  label: '❌ EVALUAR / IGNORAR (Sobre el problema · Negativo)', items: data.evaluar },
    ];

    for (const { label, items } of cuadrantes) {
      lines.push(`\n--- ${label} (${items.length} items) ---`);
      if (items.length === 0) {
        lines.push('  (sin feedback en este cuadrante)');
      } else {
        items.forEach((item, i) => {
          const fuente = FUENTE_LABELS[item.fuente] ?? item.fuente;
          const prio = PRIORIDAD_LABELS[item.prioridad] ?? item.prioridad;
          lines.push(`  ${i + 1}. "${item.texto || '(sin texto)'}"`);
          lines.push(`     Fuente: ${fuente} | Prioridad: ${prio}`);
        });
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
