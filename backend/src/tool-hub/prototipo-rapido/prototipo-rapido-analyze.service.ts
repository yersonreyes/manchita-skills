import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { PrototipoRapidoAnalyzeReqDto } from './dto/prototipo-rapido-analyze.req.dto';
import {
  PrototipoRapidoAnalyzeResDto,
  PrototipoRapidoReportDto,
} from './dto/prototipo-rapido-analyze.res.dto';
import {
  buildProjectContextSection,
  ProjectBriefContext,
} from '../shared/project-context';

const TECNICA_LABELS: Record<string, string> = {
  sketch: 'Sketch (boceto en papel)',
  'paper-prototype': 'Paper Prototype (prototipo en papel)',
  'wizard-of-oz': 'Wizard of Oz (humanos simulando el sistema)',
  'clickable-mockup': 'Clickable Mockup (Figma / Adobe XD)',
  'mvp-code': 'MVP Code (código funcional básico)',
};

const DECISION_LABELS: Record<string, string> = {
  iterar: 'Iterar — mejorar la solución actual',
  pivot: 'Pivot — cambiar de dirección',
  avanzar: 'Avanzar — pasar a desarrollo',
};

@Injectable()
export class PrototipoRapidoAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(
    dto: PrototipoRapidoAnalyzeReqDto,
  ): Promise<PrototipoRapidoAnalyzeResDto> {
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

    let report: PrototipoRapidoReportDto;
    try {
      report = JSON.parse(this.extractJson(raw)) as PrototipoRapidoReportDto;
    } catch {
      console.error('[PrototipoRapidoAnalyzeService] Raw AI response:', raw);
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

    return `Sos un experto en Design Thinking, Lean Startup y metodologías de validación rápida. Tu especialidad es analizar el ciclo de prototipado rápido: evaluar la efectividad de la técnica elegida para la hipótesis que se quería validar, calcular e interpretar la tasa de éxito de las sesiones de testing, identificar patrones en el feedback de los usuarios, y determinar si las hipótesis quedaron confirmadas, refutadas o requieren más iteración. Pensás siempre en términos de aprendizaje validado.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá el ciclo de prototipado documentado y generá un análisis de validación en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 2-3 oraciones: qué hipótesis se testeó, qué técnica se usó, cuántas sesiones se realizaron, y cuál fue el resultado general del ciclo de validación.",
  "validezDeLaHipotesis": "Análisis profundo de si la hipótesis quedó validada, refutada o parcialmente confirmada. Contemplá la tasa de éxito, la calidad del feedback y si la técnica elegida era la apropiada para esta hipótesis. Si la tasa de éxito está entre extremos, explicá qué factores pesan más para la decisión. Mencioná explícitamente si la decisión documentada (iterar/pivot/avanzar) está bien fundamentada dado el resultado.",
  "tasaExitoCalculada": "Porcentaje de éxito con contexto — ejemplo: '67% (4/6 sesiones exitosas) — zona de iteración'. Interpretá: <40% → pivot serio, 40-60% → iterar con cambios importantes, 60-80% → iterar con ajustes finos, >80% → avanzar.",
  "patronesEnElFeedback": [
    "Patrón recurrente identificado en el feedback de los usuarios — puede ser sobre usabilidad, comprensión del valor, fricción en un punto específico",
    "Segundo patrón — puede ser algo positivo que apareció consistentemente",
    "Tercer patrón si hay suficiente feedback"
  ],
  "hipotesisConfirmadas": [
    "Aspecto de la hipótesis que quedó confirmado por el testing — ser específico sobre qué evidencia lo confirma",
    "Segundo aspecto confirmado si aplica"
  ],
  "hipotesisRefutadas": [
    "Aspecto de la hipótesis que quedó refutado — ser específico sobre qué evidencia lo refuta",
    "Segundo aspecto refutado si aplica — si no hay, array vacío []"
  ],
  "riesgosRestantes": [
    "Riesgo o supuesto que este ciclo de testing NO pudo responder y sigue siendo una incógnita para el equipo",
    "Segundo riesgo restante — puede ser sobre escalabilidad, segmento diferente, caso borde no testeado",
    "Si no hay riesgos restantes evidentes, array vacío []"
  ],
  "recommendations": [
    "Qué cambiar en el prototipo o en la propuesta de valor para el próximo ciclo, basado en el patrón de feedback más importante",
    "Cómo mejorar el diseño de las sesiones de testing para obtener datos más concluyentes",
    "Qué hipótesis secundaria debería validarse en el próximo sprint de prototipado"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- tasaExitoCalculada: calculalo vos mismo a partir de las sesiones documentadas (contá éxitos / total). Si no hay sesiones, devolvé "Sin datos suficientes".
- Si hay pocas sesiones (1-2), advertilo en validezDeLaHipotesis — la muestra no es estadísticamente representativa.
- hipotesisRefutadas y riesgosRestantes pueden ser arrays vacíos [] si no aplica.
- Mínimo 2 patronesEnElFeedback (si hay feedback documentado), 1 hipotesisConfirmada, 3 recommendations.`;
  }

  private formatData(dto: PrototipoRapidoAnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== PROTOTIPO RÁPIDO ==='];

    if (data.preguntaValidar)
      lines.push(
        `\nHIPÓTESIS / PREGUNTA A VALIDAR:\n"${data.preguntaValidar}"`,
      );
    if (data.tecnica)
      lines.push(
        `\nTÉCNICA USADA: ${TECNICA_LABELS[data.tecnica] ?? data.tecnica}`,
      );
    if (data.tiempoInvertido)
      lines.push(`TIEMPO INVERTIDO: ${data.tiempoInvertido}`);
    if (data.descripcionPrototipo)
      lines.push(
        `\nDESCRIPCIÓN DEL PROTOTIPO:\n"${data.descripcionPrototipo}"`,
      );

    if (data.herramientasUsadas?.length) {
      lines.push(
        `\nHERRAMIENTAS USADAS: ${data.herramientasUsadas.join(', ')}`,
      );
    }

    if (data.sesionesTest?.length) {
      const total = data.sesionesTest.length;
      const exitosos = data.sesionesTest.filter(
        (s) => s.resultado === 'exito',
      ).length;
      const fallos = data.sesionesTest.filter(
        (s) => s.resultado === 'fallo',
      ).length;
      const parciales = data.sesionesTest.filter(
        (s) => s.resultado === 'parcial',
      ).length;
      const tasa = total > 0 ? Math.round((exitosos / total) * 100) : 0;

      lines.push(`\nSESIONES DE TESTING (${total} total | ${tasa}% éxito):`);
      lines.push(
        `  Éxitos: ${exitosos} | Fallos: ${fallos} | Parciales: ${parciales}`,
      );

      data.sesionesTest.forEach((s, i) => {
        const resultadoLabel =
          s.resultado === 'exito'
            ? '✓ Éxito'
            : s.resultado === 'fallo'
              ? '✗ Fallo'
              : '− Parcial';
        lines.push(
          `\n  ${i + 1}. Usuario: "${s.usuario ?? 'sin nombre'}" — ${resultadoLabel}`,
        );
        if (s.feedback) lines.push(`     Feedback: "${s.feedback}"`);
      });
    }

    if (data.hallazgos?.length) {
      lines.push(`\nHALLAZGOS CLAVE:`);
      data.hallazgos.forEach((h) => {
        if (h) lines.push(`  • ${h}`);
      });
    }

    if (data.decision) {
      lines.push(
        `\nDECISIÓN DEL EQUIPO: ${DECISION_LABELS[data.decision] ?? data.decision}`,
      );
    }

    if (data.iteracionesSiguientes?.length) {
      lines.push(`\nITERACIONES / PASOS SIGUIENTES:`);
      data.iteracionesSiguientes.forEach((it) => {
        if (it) lines.push(`  • ${it}`);
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
