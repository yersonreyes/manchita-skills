import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { RoadmapPrototipadoAnalyzeReqDto } from './dto/roadmap-prototipado-analyze.req.dto';
import { RoadmapPrototipadoAnalyzeResDto, RoadmapPrototipadoReportDto } from './dto/roadmap-prototipado-analyze.res.dto';
import { buildProjectContextSection, ProjectBriefContext } from '../shared/project-context';

const FIDELIDAD_LABELS: Record<string, string> = {
  low: 'Low-fi (bocetos, papel)',
  'low-mid': 'Low-mid (wireframes)',
  mid: 'Mid-fi (clickable prototype)',
  'mid-hi': 'Mid-high (interactive)',
  high: 'High-fi (mockup final)',
};

const PROPOSITO_LABELS: Record<string, string> = {
  explorar: 'Explorar ideas',
  validar: 'Validar con usuarios',
  comunicar: 'Comunicar a stakeholders',
  refinar: 'Refinar y detallar',
};

const PRIORIDAD_LABELS: Record<string, string> = {
  alta: 'Alta prioridad 🔴',
  media: 'Media prioridad 🟡',
  baja: 'Baja prioridad 🟢',
};

@Injectable()
export class RoadmapPrototipadoAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(dto: RoadmapPrototipadoAnalyzeReqDto): Promise<RoadmapPrototipadoAnalyzeResDto> {
    const { tool, project } = await this.loadContext(dto.toolApplicationId);
    const systemPrompt = this.buildSystemPrompt(tool, project);
    const dataText = this.formatData(dto);

    const raw = await this.aiService.chat(
      [{ role: 'user', content: `${dataText}\n\nGenerá el análisis en JSON ahora.` }],
      systemPrompt,
      2048,
    );

    let report: RoadmapPrototipadoReportDto;
    try {
      report = JSON.parse(this.extractJson(raw)) as RoadmapPrototipadoReportDto;
    } catch {
      console.error('[RoadmapPrototipadoAnalyzeService] Raw AI response:', raw);
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

    return `Sos un experto en design process planning, prototipado estratégico y project management de equipos de UX. Tu especialidad es analizar roadmaps de prototipado: evaluar si la secuencia de prototipos tiene sentido estratégico (¿empieza con low-fi?), identificar cuellos de botella y dependencias que pueden bloquear al equipo, detectar riesgos de timing realistas, y recomendar ajustes de priorización basados en el objetivo del proyecto.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá el roadmap de prototipado documentado y generá un análisis estratégico en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 2-3 oraciones: cuántas fases tiene el roadmap, cuántos prototipos en total, cuál es el objetivo general y cuál es el estado de progreso.",
  "evaluacionEstrategia": "Evaluación de la estrategia general del roadmap: ¿la secuencia de fidelidad tiene sentido (low-fi primero)? ¿el propósito de cada prototipo está alineado con la fase? ¿hay fases redundantes o que se pueden consolidar? ¿el equipo y la duración son realistas para la cantidad de trabajo?",
  "riesgosTimeline": [
    "Riesgo concreto del timeline — qué fase o prototipo tiene mayor probabilidad de generar retrasos y por qué",
    "Más riesgos si los hay"
  ],
  "bottlenecks": [
    "Cuello de botella identificado — qué dependencia entre fases o prototipos puede bloquear al equipo",
    "Más bottlenecks si los hay"
  ],
  "prioridadRecomendada": "Evaluación de la priorización de features: ¿las features de alta prioridad están siendo prototipadas primero? ¿hay features críticas que aparecen demasiado tarde en el roadmap? ¿hay features de baja prioridad que consumen recursos que podrían ir a cosas más importantes?",
  "recommendations": [
    "Ajuste inmediato y concreto — qué cambiaría en el roadmap ahora mismo para reducir el riesgo más grande",
    "Qué fase o prototipo se puede paralelizar con otro para ganar tiempo sin perder calidad",
    "Cómo manejar los cambios inevitables del roadmap — qué tiene que pasar para que el equipo pueda pivotar rápido sin descarrilar el proceso"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- Si el roadmap empieza con high-fi antes de validar, señalalo como riesgo crítico.
- Un roadmap sin buffer para iteración es siempre un riesgo — mencionalo si no está contemplado.
- Los prototipos "comunicar" para stakeholders deben tener timing adecuado respecto a los de "validar" con usuarios.
- Mínimo 2 riesgosTimeline, 2 bottlenecks, 3 recommendations.`;
  }

  private formatData(dto: RoadmapPrototipadoAnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== ROADMAP DE PROTOTIPADO ==='];

    if (data.contexto) lines.push(`\nCONTEXTO:\n"${data.contexto}"`);
    if (data.equipo) lines.push(`\nEQUIPO: ${data.equipo}`);
    if (data.duracionTotal) lines.push(`DURACIÓN TOTAL: ${data.duracionTotal}`);

    if (data.restricciones?.length) {
      lines.push(`\nRESTRICCIONES Y DEPENDENCIAS:`);
      data.restricciones.forEach(r => { if (r) lines.push(`  ⚠ ${r}`); });
    }

    if (data.fases?.length) {
      const totalPrototipos = data.fases.reduce((acc, f) => acc + (f.prototipos?.length ?? 0), 0);
      const completados = data.fases.reduce((acc, f) => acc + (f.prototipos?.filter(p => p.completado)?.length ?? 0), 0);
      lines.push(`\nFASES DEL ROADMAP (${data.fases.length} fases, ${totalPrototipos} prototipos total, ${completados} completados):`);

      data.fases.forEach((fase, i) => {
        lines.push(`\n  FASE ${i + 1}: ${fase.nombre || '(sin nombre)'}${fase.semanas ? ` — ${fase.semanas}` : ''}`);
        if (fase.objetivo) lines.push(`  Objetivo: "${fase.objetivo}"`);
        if (fase.prototipos?.length) {
          fase.prototipos.forEach((p, j) => {
            const estado = p.completado ? '[✓ Completado]' : '[Pendiente]';
            const fidelidad = FIDELIDAD_LABELS[p.fidelidad ?? ''] ?? p.fidelidad ?? '?';
            const proposito = PROPOSITO_LABELS[p.proposito ?? ''] ?? p.proposito ?? '?';
            lines.push(`    ${j + 1}. ${estado} ${p.nombre || '(sin nombre)'}`);
            lines.push(`       Fidelidad: ${fidelidad} | Propósito: ${proposito}`);
            if (p.herramienta) lines.push(`       Herramienta: ${p.herramienta}`);
            if (p.entregable) lines.push(`       Entregable: "${p.entregable}"`);
          });
        } else {
          lines.push(`    (sin prototipos definidos)`);
        }
      });
    }

    if (data.features?.length) {
      lines.push(`\nPRIORIZACIÓN DE FEATURES (${data.features.length}):`);
      data.features.forEach(f => {
        const prio = PRIORIDAD_LABELS[f.prioridad ?? ''] ?? f.prioridad ?? '?';
        lines.push(`  • ${prio} — ${f.nombre || '(sin nombre)'}${f.fase ? ` → ${f.fase}` : ''}`);
        if (f.razon) lines.push(`    Razón: "${f.razon}"`);
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
