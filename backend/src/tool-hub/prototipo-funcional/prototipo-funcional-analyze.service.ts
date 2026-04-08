import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { PrototipoFuncionalAnalyzeReqDto } from './dto/prototipo-funcional-analyze.req.dto';
import {
  PrototipoFuncionalAnalyzeResDto,
  PrototipoFuncionalReportDto,
} from './dto/prototipo-funcional-analyze.res.dto';
import {
  buildProjectContextSection,
  ProjectBriefContext,
} from '../shared/project-context';

const TIPO_LABELS: Record<string, string> = {
  mvp: 'MVP (Producto Mínimo Viable)',
  pilot: 'Pilot (versión limitada en producción)',
  beta: 'Beta (almost production, validación amplia)',
  'feature-flag': 'Feature Flag (funcionalidad toggled)',
};

const ESTADO_LABELS: Record<string, string> = {
  pendiente: 'Pendiente de implementar',
  funcionando: 'Funcionando correctamente',
  'con-bugs': 'Con bugs',
};

const TIPO_HALLAZGO_LABELS: Record<string, string> = {
  funcional: 'Bug funcional',
  ux: 'Problema de UX',
  performance: 'Issue de performance',
};

const PRIORIDAD_LABELS: Record<string, string> = {
  alta: 'Alta prioridad',
  media: 'Media prioridad',
  baja: 'Baja prioridad',
};

@Injectable()
export class PrototipoFuncionalAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(
    dto: PrototipoFuncionalAnalyzeReqDto,
  ): Promise<PrototipoFuncionalAnalyzeResDto> {
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

    let report: PrototipoFuncionalReportDto;
    try {
      report = JSON.parse(this.extractJson(raw)) as PrototipoFuncionalReportDto;
    } catch {
      console.error('[PrototipoFuncionalAnalyzeService] Raw AI response:', raw);
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

    return `Sos un experto en validación técnica de productos digitales, prototipado funcional y testing de usabilidad avanzado. Tu especialidad es analizar procesos de testing con prototipos funcionales: evaluar qué flujos críticos fueron validados, identificar la severidad de los hallazgos funcionales y de UX, y determinar si el equipo está listo para comprometer recursos en desarrollo completo.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá el prototipo funcional documentado y generá un análisis técnico en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 2-3 oraciones: qué tipo de prototipo se construyó, qué flujos fueron testeados, cuántos hallazgos se encontraron y cuál es el estado general de validación técnica.",
  "validacionTecnica": "Evaluación técnica detallada: qué fue lo más difícil de implementar, qué restricciones técnicas aparecieron durante el prototipado, y qué aprendizajes técnicos son relevantes para el desarrollo final.",
  "hallazgosCriticos": [
    "Bug funcional crítico o issue técnico encontrado — qué impacta, en qué flujo y cuál es su severidad",
    "Más hallazgos funcionales si los hay"
  ],
  "hallazgosUX": [
    "Problema de experiencia de usuario encontrado — qué comportamiento del usuario reveló el problema",
    "Más hallazgos de UX si los hay"
  ],
  "estadoFlujos": "Evaluación del estado de los flujos críticos: cuáles funcionan bien, cuáles tienen issues, cuáles quedaron sin implementar y qué riesgo representa cada uno para el go-live.",
  "nivelConfianza": "Evaluación honesta de cuán listos están para comprometer recursos en desarrollo completo. ¿Qué validaron? ¿Qué riesgos técnicos quedan sin resolver? ¿Qué haría que se bajen del prototipo al código con más seguridad?",
  "recommendations": [
    "Primer paso inmediato — si deben iterar el prototipo, resolver bugs específicos antes de seguir, o ya pueden avanzar",
    "Qué hallazgo tiene mayor impacto en la arquitectura técnica del producto final y cómo manejarlo",
    "Cómo llevar los aprendizajes del prototipo al proceso de desarrollo para no repetir los errores encontrados"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- Si hay flujos marcados como "con-bugs", analizalos como riesgos para el go-live.
- Los hallazgos resueltos son igual de valiosos — mencioná si la resolución reveló algo sobre la arquitectura.
- nivelConfianza debe ser honesto — si hay bugs sin resolver o flujos incompletos, decilo.
- Mínimo 2 hallazgosCriticos (si los hay), 2 hallazgosUX (si los hay), 3 recommendations.
- Si no hay hallazgos de algún tipo, mencioná en ese array que no se detectaron issues de ese tipo.`;
  }

  private formatData(dto: PrototipoFuncionalAnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== PROTOTIPO FUNCIONAL ==='];

    if (data.objetivo) lines.push(`\nOBJETIVO:\n"${data.objetivo}"`);
    if (data.tipo)
      lines.push(`\nTIPO DE PROTOTIPO: ${TIPO_LABELS[data.tipo] ?? data.tipo}`);
    if (data.herramientas?.length)
      lines.push(
        `\nHERRAMIENTAS USADAS:\n${data.herramientas.map((h) => `  • ${h}`).join('\n')}`,
      );

    if (data.flujosCriticos?.length) {
      lines.push(`\nFLUJOS CRÍTICOS (${data.flujosCriticos.length}):`);
      data.flujosCriticos.forEach((f, i) => {
        const estado =
          ESTADO_LABELS[f.estado ?? ''] ?? f.estado ?? 'sin estado';
        lines.push(
          `\n  Flujo ${i + 1}: ${f.nombre || '(sin nombre)'} — ${estado}`,
        );
        if (f.descripcion) lines.push(`  Descripción: "${f.descripcion}"`);
      });
    }

    if (data.features?.length) {
      lines.push(`\nFEATURES PRIORIZADAS (${data.features.length}):`);
      data.features.forEach((f) => {
        const estado = f.incluida ? 'INCLUIDA' : 'EXCLUIDA';
        const prio = PRIORIDAD_LABELS[f.prioridad ?? ''] ?? f.prioridad ?? '';
        lines.push(`  • [${estado}] ${f.nombre || '(sin nombre)'} — ${prio}`);
        if (f.notas) lines.push(`    Notas: "${f.notas}"`);
      });
    }

    if (data.hallazgos?.length) {
      const pendientes = data.hallazgos.filter((h) => !h.resuelto);
      const resueltos = data.hallazgos.filter((h) => h.resuelto);
      lines.push(
        `\nHALLAZGOS DEL TESTING (${data.hallazgos.length} total, ${pendientes.length} pendientes, ${resueltos.length} resueltos):`,
      );
      data.hallazgos.forEach((h, i) => {
        const tipo = TIPO_HALLAZGO_LABELS[h.tipo ?? ''] ?? h.tipo ?? '';
        const estado = h.resuelto ? '[RESUELTO]' : '[PENDIENTE]';
        lines.push(`\n  ${i + 1}. ${tipo} ${estado}`);
        if (h.descripcion) lines.push(`     "${h.descripcion}"`);
      });
    }

    if (data.proximosPasos?.length) {
      lines.push(`\nPRÓXIMOS PASOS PLANIFICADOS:`);
      data.proximosPasos.forEach((p) => {
        if (p) lines.push(`  • ${p}`);
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
