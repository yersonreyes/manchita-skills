import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { PrototipoEmpatizarAnalyzeReqDto } from './dto/prototipo-empatizar-analyze.req.dto';
import {
  PrototipoEmpatizarAnalyzeResDto,
  PrototipoEmpatizarReportDto,
} from './dto/prototipo-empatizar-analyze.res.dto';
import {
  buildProjectContextSection,
  ProjectBriefContext,
} from '../shared/project-context';

const TIPO_LABELS: Record<string, string> = {
  'role-play': 'Role-play (actuar la experiencia)',
  bodystorming: 'Bodystorming (prototipar con el cuerpo)',
  environmental: 'Environmental (recrear el entorno)',
  experiencial: 'Experiencial (vivir la experiencia completa)',
};

@Injectable()
export class PrototipoEmpatizarAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(
    dto: PrototipoEmpatizarAnalyzeReqDto,
  ): Promise<PrototipoEmpatizarAnalyzeResDto> {
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

    let report: PrototipoEmpatizarReportDto;
    try {
      report = JSON.parse(this.extractJson(raw)) as PrototipoEmpatizarReportDto;
    } catch {
      console.error('[PrototipoEmpatizarAnalyzeService] Raw AI response:', raw);
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

    return `Sos un experto en investigación de usuarios, diseño de experiencias y facilitación de prototipos de empatía. Tu especialidad es analizar sesiones de prototipado empático: leer entre líneas lo que el equipo observó, conectar las fricciones emocionales con implicaciones de diseño concretas, y evaluar si los supuestos del equipo fueron confirmados o refutados por la experiencia vivida.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá la sesión de prototipo para empatizar documentada y generá un análisis de empatía en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 2-3 oraciones: tipo de prototipo usado, qué se buscó sentir, cuántos pasos tuvo la sesión, y cuál fue el hallazgo emocional más impactante.",
  "nivelEmpatiaAlcanzado": "Descripción del nivel de empatía que logró el equipo con esta sesión: qué tan profundo fue el entendimiento emocional obtenido, qué perspectiva del usuario se ganó y qué aspectos del problema quedaron sin explorar.",
  "insightsClaves": [
    "Insight empático concreto — algo que el equipo NO sabía antes de la sesión y que ahora sabe con certeza",
    "Segundo insight — puede ser una emoción, una barrera o un comportamiento inesperado",
    "Más insights si los hay"
  ],
  "friccionesEmocionales": [
    {
      "momento": "En qué paso o momento de la sesión ocurrió la fricción",
      "emocion": "Qué emoción experimentó el equipo o qué emoción del usuario se reveló",
      "intensidad": "alta | media | baja"
    }
  ],
  "supuestosContrastados": [
    {
      "supuesto": "El supuesto tal como fue planteado",
      "resultado": "validado | refutado | parcial",
      "evidencia": "Qué pasó en la sesión que confirma, refuta o matiza este supuesto"
    }
  ],
  "implicacionesDiseno": [
    "Qué debe cambiar en el diseño del producto o servicio a partir de este aprendizaje empático",
    "Segunda implicación — puede ser sobre el flujo, el lenguaje, los tiempos o los estados emocionales",
    "Tercera implicación si aplica"
  ],
  "recommendations": [
    "Qué prototipar o investigar a continuación — qué aspecto de la empatía quedó sin resolver",
    "Cómo incorporar estos aprendizajes en la fase de definición o ideación",
    "Qué tipo de usuario o situación explorar en la próxima sesión para ampliar el entendimiento"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- En insightsClaves: escribí insights accionables, no observaciones genéricas. "El usuario se frustra" es malo. "La frustración surge cuando el usuario pierde el hilo de su progreso sin indicadores visuales" es bueno.
- En friccionesEmocionales: basate en los pasos y observaciones documentadas. Si no hay observaciones explícitas, inferí las emociones del contexto del objetivo y el tipo de prototipo.
- En supuestosContrastados: si el equipo no documentó supuestos explícitos, derivá supuestos implícitos del objetivo y del tipo de prototipo, y evaluá si la sesión los confirmó o refutó.
- Mínimo 3 insightsClaves, 2 friccionesEmocionales, 3 implicacionesDiseno, 3 recommendations.`;
  }

  private formatData(dto: PrototipoEmpatizarAnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== PROTOTIPO PARA EMPATIZAR ==='];

    if (data.tipoPrototipo) {
      lines.push(
        `\nTIPO DE PROTOTIPO: ${TIPO_LABELS[data.tipoPrototipo] ?? data.tipoPrototipo}`,
      );
    }

    if (data.objetivo) lines.push(`\nOBJETIVO:\n"${data.objetivo}"`);
    if (data.contexto) lines.push(`\nCONTEXTO:\n"${data.contexto}"`);

    if (data.participantes?.length) {
      lines.push(`\nPARTICIPANTES: ${data.participantes.join(', ')}`);
    }

    if (data.pasos?.length) {
      lines.push(`\nPASOS DE LA SESIÓN (${data.pasos.length}):`);
      data.pasos.forEach((paso, i) => {
        lines.push(`\n  ${i + 1}. ${paso.descripcion || '(sin descripción)'}`);
        if (paso.observacion)
          lines.push(`     → Observación: "${paso.observacion}"`);
      });
    }

    if (data.insightsEmocionales?.length) {
      lines.push(`\nINSIGHTS EMOCIONALES CAPTURADOS:`);
      data.insightsEmocionales.forEach((i) => {
        if (i) lines.push(`  • "${i}"`);
      });
    }

    if (data.friccionesIdentificadas?.length) {
      lines.push(`\nFRICCIONES IDENTIFICADAS:`);
      data.friccionesIdentificadas.forEach((f) => {
        if (f) lines.push(`  • "${f}"`);
      });
    }

    if (data.supuestosValidados?.length) {
      lines.push(`\nSUPUESTOS A VALIDAR:`);
      data.supuestosValidados.forEach((s) => {
        if (s) lines.push(`  • "${s}"`);
      });
    }

    if (data.notas) lines.push(`\nNOTAS ADICIONALES:\n"${data.notas}"`);

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
