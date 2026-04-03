import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { WhatIfAnalyzeReqDto } from './dto/what-if-analyze.req.dto';
import { WhatIfAnalyzeResDto, WhatIfReportDto } from './dto/what-if-analyze.res.dto';
import { buildProjectContextSection, ProjectBriefContext } from '../shared/project-context';

const TIPO_LABELS: Record<string, string> = {
  inversion: 'Inversión',
  extremo: 'Extremo',
  tecnologico: 'Tecnológico',
  usuario: 'Usuario',
  competitivo: 'Competitivo',
  contextual: 'Contextual',
};

@Injectable()
export class WhatIfAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(dto: WhatIfAnalyzeReqDto): Promise<WhatIfAnalyzeResDto> {
    const { tool, project } = await this.loadContext(dto.toolApplicationId);
    const systemPrompt = this.buildSystemPrompt(tool, project);
    const dataText = this.formatData(dto);

    const raw = await this.aiService.chat(
      [{ role: 'user', content: `${dataText}\n\nGenerá el análisis en JSON ahora.` }],
      systemPrompt,
      2048,
    );

    let report: WhatIfReportDto;
    try {
      report = JSON.parse(this.extractJson(raw)) as WhatIfReportDto;
    } catch {
      console.error('[WhatIfAnalyzeService] Raw AI response:', raw);
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

    return `Sos un experto en pensamiento divergente, Design Thinking e innovación disruptiva. Tu especialidad es analizar sesiones de What If: evaluar el potencial innovador de las preguntas hipotéticas generadas, identificar patrones en el tipo de cuestionamientos del equipo, detectar los temas emergentes y qué preguntas tienen mayor potencial para generar innovación real.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá el conjunto de preguntas What If documentadas y generá un análisis estratégico en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 2-3 oraciones: cuántas preguntas se generaron, qué tipos dominaron, cuáles son las más disruptivas y qué recomienda el análisis como próximo paso.",
  "preguntasMasDisruptivas": [
    {
      "pregunta": "Texto de la pregunta sin el '¿Qué pasaría si…?' inicial — ej: 'no existieran los passwords'",
      "tipo": "Tipo de What If que representa: Inversión / Extremo / Tecnológico / Usuario / Competitivo / Contextual",
      "potencialInnovador": "Por qué esta pregunta tiene alto potencial innovador — qué assumption desafía, qué oportunidad abre",
      "implicaciones": [
        "Primera implicación concreta de explorar este escenario",
        "Segunda implicación — puede ser técnica, de negocio, de experiencia de usuario"
      ],
      "comoPrototipar": "Qué acción concreta debería tomar el equipo para explorar este What If (ej: prototipo en papel, entrevista con usuarios, spike técnico)"
    }
  ],
  "patronesDePensamiento": [
    "Patrón observado en el tipo de preguntas generadas — ej: el equipo tendió a cuestionar fricción (inversión) más que a buscar nuevos modelos",
    "Segundo patrón — ej: las preguntas más exploradas fueron tecnológicas, lo que sugiere que el equipo ve la IA como habilitador central",
    "Tercer patrón si aplica — ej: pocas preguntas cuestionaron al usuario, hay un punto ciego en ese eje"
  ],
  "insightsDerivados": [
    "Insight concreto que surge de analizar el set de preguntas — algo que el equipo probablemente no verbalizó explícitamente",
    "Segundo insight — puede ser sobre los assumptions más arraigados del equipo",
    "Tercer insight si aplica"
  ],
  "temasEmergentes": [
    "Tema o área que concentra varias preguntas — ej: 'Eliminación de fricción en onboarding'",
    "Segundo tema emergente",
    "Tercer tema si aplica"
  ],
  "recommendations": [
    "Qué hacer con las preguntas seleccionadas como próximo paso (ej: elegir 2-3 para prototipar en baja fidelidad)",
    "Cómo profundizar en los temas emergentes detectados",
    "Si hacer una segunda ronda de What If y en qué dirección — qué tipos están subrepresentados"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- En preguntasMasDisruptivas: priorizá las preguntas marcadas como "seleccionadas" por el equipo. Si no hay, elegí las que tienen mayor potencial innovador basándote en el texto.
- Mínimo 2 preguntasMasDisruptivas (o todas las seleccionadas), 2 patronesDePensamiento, 2 insightsDerivados, 2 temasEmergentes, 3 recommendations.
- Si el contexto no está definido, inferí el dominio desde las preguntas y mencionalo en el executiveSummary.`;
  }

  private formatData(dto: WhatIfAnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== SESIÓN WHAT IF ==='];

    if (data.contexto) lines.push(`\nCONTEXTO / RETO:\n"${data.contexto}"`);
    else lines.push('\nCONTEXTO: [No definido]');

    lines.push(`\nTOTAL DE PREGUNTAS GENERADAS: ${data.preguntas?.length ?? 0}`);

    const seleccionadas = data.preguntas?.filter(p => p.seleccionada) ?? [];
    if (seleccionadas.length) {
      lines.push(`PREGUNTAS SELECCIONADAS POR EL EQUIPO: ${seleccionadas.length}`);
    }

    if (data.preguntas?.length) {
      lines.push('\nPREGUNTAS WHAT IF:');

      data.preguntas.forEach((p, i) => {
        const tipoLabel = p.tipo ? ` [${TIPO_LABELS[p.tipo] ?? p.tipo}]` : '';
        const selLabel = p.seleccionada ? ' ★ SELECCIONADA' : '';
        lines.push(`\n  ${i + 1}. ¿Qué pasaría si ${p.pregunta || '[sin texto]'}?${tipoLabel}${selLabel}`);
        if (p.exploracion) lines.push(`     Exploración: ${p.exploracion}`);
      });
    }

    if (data.insightsClave?.length) {
      lines.push('\nINSIGHTS CLAVE DEL EQUIPO:');
      data.insightsClave.forEach(ins => lines.push(`  • ${ins}`));
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
