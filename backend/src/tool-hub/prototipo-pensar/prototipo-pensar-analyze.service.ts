import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { PrototipoPensarAnalyzeReqDto } from './dto/prototipo-pensar-analyze.req.dto';
import {
  PrototipoPensarAnalyzeResDto,
  PrototipoPensarReportDto,
} from './dto/prototipo-pensar-analyze.res.dto';
import {
  buildProjectContextSection,
  ProjectBriefContext,
} from '../shared/project-context';

const TIPO_LABELS: Record<string, string> = {
  sketch: 'Sketch (dibujo rápido en papel)',
  wireframe: 'Wireframe (estructura básica sin estilo)',
  storyboard: 'Storyboard (secuencia de pantallas)',
  'paper-prototype': 'Paper Prototype (interactivo en papel)',
};

@Injectable()
export class PrototipoPensarAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(
    dto: PrototipoPensarAnalyzeReqDto,
  ): Promise<PrototipoPensarAnalyzeResDto> {
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

    let report: PrototipoPensarReportDto;
    try {
      report = JSON.parse(this.extractJson(raw)) as PrototipoPensarReportDto;
    } catch {
      console.error('[PrototipoPensarAnalyzeService] Raw AI response:', raw);
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

    return `Sos un experto en diseño iterativo, prototipado rápido y Design Thinking. Tu especialidad es analizar procesos de prototipado: leer cómo evolucionó el pensamiento del equipo a través de las iteraciones, identificar qué hipótesis fueron validadas o descartadas por la evidencia recolectada, y sintetizar los aprendizajes en implicaciones concretas para el desarrollo.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá el proceso de prototipado documentado y generá un análisis del pensamiento iterativo en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 2-3 oraciones: cuántas iteraciones se realizaron, qué tipos de prototipo se usaron, cuál fue la pregunta central que se intentó responder y en qué iteración se cristalizó la decisión final.",
  "evolucionDelPensamiento": "Narrativa de cómo evolucionaron las ideas del equipo a través de las iteraciones. Qué cambió entre cada iteración, qué fue lo que hizo que el equipo pasara de una forma al siguiente. Si hubo iteraciones descartadas, qué rol jugaron en la evolución.",
  "hipotesisValidadas": [
    {
      "hipotesis": "La hipótesis que quedó confirmada — inferida de los aprendizajes del equipo aunque no esté explícitamente formulada como hipótesis",
      "evidencia": "Qué observaron o aprendieron en las iteraciones que confirma esta hipótesis"
    }
  ],
  "hipotesisDescartadas": [
    {
      "hipotesis": "La hipótesis o dirección que fue descartada",
      "evidencia": "Qué evidencia del proceso de prototipado llevó a descartarla"
    }
  ],
  "aprendizajesClave": [
    "Aprendizaje concreto y accionable que el equipo obtuvo del proceso de prototipado — no una observación sino algo que cambia cómo van a diseñar",
    "Segundo aprendizaje — puede ser sobre los usuarios, el problema, las restricciones técnicas o el propio proceso",
    "Más aprendizajes si los hay"
  ],
  "estadoConfianza": "Evaluación honesta de cuán listos está el equipo para comprometer recursos en desarrollo. ¿Qué validaron con el prototipado? ¿Qué quedaría sin validar? ¿Cuál sería el riesgo de pasar a código ahora?",
  "recommendations": [
    "Siguiente paso inmediato — si deben iterar más o ya pueden avanzar a desarrollo, y en qué fidelidad",
    "Qué aspecto específico de la solución elegida todavía tiene mayor incertidumbre y cómo reducirla",
    "Cómo llevar los aprendizajes del prototipado al proceso de desarrollo para que no se pierdan"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- Las hipótesisValidadas y descartadas deben ser inferidas del proceso aunque no estén formuladas explícitamente — el equipo prototipar implica hipótesis aunque no las verbalice.
- Si hay iteraciones marcadas como descartadas, analizalas como evidencia de qué direcciones NO funcionaron.
- estadoConfianza debe ser una evaluación honesta — no siempre el estado es "listo para desarrollo". Si hay riesgos, nombralos.
- Mínimo 2 hipotesisValidadas, 1 hipotesisDescartada (si las hay), 3 aprendizajesClave, 3 recommendations.`;
  }

  private formatData(dto: PrototipoPensarAnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== PROTOTIPO PARA PENSAR ==='];

    if (data.preguntaExplorar)
      lines.push(
        `\nPREGUNTA / HIPÓTESIS A EXPLORAR:\n"${data.preguntaExplorar}"`,
      );
    if (data.contexto) lines.push(`\nCONTEXTO:\n"${data.contexto}"`);

    if (data.iteraciones?.length) {
      lines.push(`\nITERACIONES (${data.iteraciones.length}):`);
      data.iteraciones.forEach((iter, i) => {
        const estado = iter.descartada ? ' [DESCARTADA]' : '';
        const tipo = iter.tipo
          ? ` — ${TIPO_LABELS[iter.tipo] ?? iter.tipo}`
          : '';
        lines.push(`\n  Iteración ${i + 1}${tipo}${estado}`);
        if (iter.herramienta) lines.push(`  Herramienta: ${iter.herramienta}`);
        if (iter.duracion) lines.push(`  Duración: ${iter.duracion}`);
        if (iter.descripcion)
          lines.push(`  Descripción: "${iter.descripcion}"`);
        if (iter.aprendizajes?.length) {
          lines.push(`  Aprendizajes:`);
          iter.aprendizajes.forEach((a) => {
            if (a) lines.push(`    • "${a}"`);
          });
        }
      });
    }

    if (data.decisionFinal)
      lines.push(`\nDECISIÓN FINAL:\n"${data.decisionFinal}"`);

    if (data.proximosPasos?.length) {
      lines.push(`\nPRÓXIMOS PASOS:`);
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
