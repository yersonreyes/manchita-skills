import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { TestUsuarioAnalyzeReqDto } from './dto/test-usuario-analyze.req.dto';
import {
  TestUsuarioAnalyzeResDto,
  TestUsuarioReportDto,
} from './dto/test-usuario-analyze.res.dto';
import {
  buildProjectContextSection,
  ProjectBriefContext,
} from '../shared/project-context';

const EXITO_LABELS: Record<string, string> = {
  si: '✅ Completó',
  parcial: '⚠️ Parcial',
  no: '❌ No completó',
};

const TIPO_LABELS: Record<string, string> = {
  moderado: 'Moderado (con facilitador)',
  'no-moderado': 'No moderado (autónomo)',
  remoto: 'Remoto',
  presencial: 'Presencial / Laboratorio',
  guerrilla: 'Guerrilla (espacio público)',
};

@Injectable()
export class TestUsuarioAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(
    dto: TestUsuarioAnalyzeReqDto,
  ): Promise<TestUsuarioAnalyzeResDto> {
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

    let report: TestUsuarioReportDto;
    try {
      report = JSON.parse(this.extractJson(raw)) as TestUsuarioReportDto;
    } catch {
      console.error('[TestUsuarioAnalyzeService] Raw AI response:', raw);
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

    return `Sos un experto en User Testing, investigación de usabilidad y análisis de comportamiento de usuarios. Tu especialidad es observar cómo usuarios reales interactúan con diseños y extraer insights accionables: identificar patrones de fracaso, problemas críticos que impiden completar tareas, citas que revelan modelos mentales erróneos, y formular recomendaciones de diseño precisas. Aplicás el método de análisis de Nielsen Norman Group.

REGLA DE ORO DEL TEST DE USUARIO: Los comportamientos y errores observados son evidencia de fallas del diseño, no de los usuarios. Siempre culpá al diseño, nunca al usuario.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá las sesiones de test de usuario documentadas y generá un análisis en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 2-3 oraciones: cuántos participantes, cuántas tareas evaluadas, cuál es la tasa de éxito general y cuál es el problema de usabilidad más crítico encontrado.",
  "tasaExitoGlobal": "Calculá la tasa de éxito considerando todas las tareas de todas las sesiones (éxito completo = 1, parcial = 0.5, fracaso = 0). Comparar contra el benchmark del 78% de éxito de Nielsen Norman Group. Si hay pocas tareas, señalarlo.",
  "problemasRecurrentes": [
    "Problema crítico que apareció en múltiples sesiones, con evidencia específica: cuántos usuarios lo encontraron y en qué tarea",
    "Segundo problema con misma estructura"
  ],
  "hallazgosDestacados": [
    "Hallazgo cualitativo clave: qué reveló el comportamiento del usuario sobre el diseño o el modelo mental del usuario",
    "Otro hallazgo con implicaciones para el diseño"
  ],
  "citasRelevantes": [
    "Cita textual o paráfrasis fiel que captura una confusión o insight crítico del usuario",
    "Otra cita relevante con contexto"
  ],
  "patronesComportamiento": [
    "Patrón transversal observado en múltiples sesiones: cómo los usuarios se comportan de forma consistente",
    "Otro patrón con implicaciones de diseño"
  ],
  "recommendations": [
    "Primera iteración concreta: qué elemento de diseño cambiar exactamente y por qué, con referencia a la evidencia",
    "Segunda recomendación: qué testear en la próxima iteración",
    "Tercera recomendación: cómo priorizar los cambios según impacto en la tasa de éxito"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- Citá evidencia específica: "3 de 5 usuarios", "en la Tarea 2", "el Participante 3 dijo...".
- Los problemas recurrentes deben tener evidencia de al menos 2 sesiones.
- Si hay pocas sesiones (1-2), señalalo como limitación del análisis.
- Mínimo 2 problemasRecurrentes, 2 hallazgosDestacados, 2 citasRelevantes, 2 patronesComportamiento, 3 recommendations.`;
  }

  private formatData(dto: TestUsuarioAnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== TEST DE USUARIO ==='];

    if (data.objetivos) lines.push(`\nObjetivos: ${data.objetivos}`);
    if (data.prototipo) lines.push(`Prototipo: ${data.prototipo}`);

    if (data.sesiones?.length) {
      lines.push(`\n--- SESIONES (${data.sesiones.length} participantes) ---`);
      data.sesiones.forEach((s, i) => {
        lines.push(
          `\n[Sesión ${i + 1}] ${s.participante || 'Participante ' + (i + 1)}`,
        );
        if (s.perfil) lines.push(`  Perfil: ${s.perfil}`);
        if (s.fecha) lines.push(`  Fecha: ${s.fecha}`);
        if (s.tipo) lines.push(`  Tipo: ${TIPO_LABELS[s.tipo] ?? s.tipo}`);

        if (s.tareas?.length) {
          lines.push('  Tareas:');
          s.tareas.forEach((t, ti) => {
            const exito = t.exito
              ? (EXITO_LABELS[t.exito] ?? t.exito)
              : '⬜ Sin registro';
            const tiempo =
              t.tiempoSegundos != null ? ` | ${t.tiempoSegundos}s` : '';
            lines.push(
              `    ${ti + 1}. "${t.nombre || '(sin nombre)'}" → ${exito}${tiempo}`,
            );
            if (t.observaciones) lines.push(`       Obs: ${t.observaciones}`);
          });
        }

        if (s.hallazgos) lines.push(`  Hallazgos: ${s.hallazgos}`);
        if (s.citas?.length) {
          lines.push('  Citas:');
          s.citas.forEach((c) => lines.push(`    - "${c}"`));
        }
      });
    }

    if (data.notas) lines.push(`\nNotas generales: ${data.notas}`);

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
