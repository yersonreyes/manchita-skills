import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { EntrevistaExpertoAnalyzeReqDto } from './dto/entrevista-experto-analyze.req.dto';
import {
  EntrevistaExpertoAnalyzeResDto,
  EntrevistaExpertoReportDto,
} from './dto/entrevista-experto-analyze.res.dto';
import {
  buildProjectContextSection,
  ProjectBriefContext,
} from '../shared/project-context';

@Injectable()
export class EntrevistaExpertoAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(
    dto: EntrevistaExpertoAnalyzeReqDto,
  ): Promise<EntrevistaExpertoAnalyzeResDto> {
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

    let report: EntrevistaExpertoReportDto;
    try {
      report = JSON.parse(this.extractJson(raw)) as EntrevistaExpertoReportDto;
    } catch {
      console.error('[EntrevistaExpertoAnalyzeService] Raw AI response:', raw);
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

    return `Sos un experto en investigación estratégica, análisis de dominio y síntesis de conocimiento técnico especializado.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá la entrevista con el experto del dominio y generá un análisis de conocimiento técnico en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 3-4 oraciones: quién es el experto, cuál es su área de expertise, cuáles son los hallazgos técnicos más relevantes para el proyecto y qué perspectiva única aportó.",
  "perfilExperto": "Descripción concisa del perfil del experto, su experiencia y por qué su perspectiva es relevante para este proyecto (1-2 oraciones).",
  "insights": [
    {
      "categoria": "Tendencia / Barrera / Oportunidad / Tecnología / Mercado / Regulación / Práctica",
      "insight": "El insight técnico en sí: qué revela este experto sobre el dominio que es relevante para el proyecto.",
      "evidencia": "Cita o paráfrasis de la entrevista que sostiene este insight."
    }
  ],
  "tendenciasClave": [
    "Tendencia del sector o tecnología que el experto identificó como relevante",
    "Otra tendencia con impacto en el proyecto"
  ],
  "barrerasYDesafios": [
    "Obstáculo, complejidad técnica o restricción estructural que el experto señaló",
    "Otra barrera con impacto en la viabilidad del proyecto"
  ],
  "oportunidadesIdentificadas": [
    "Oportunidad concreta del sector, tecnología o mercado que el experto mencionó",
    "Otra oportunidad para explorar o capitalizar"
  ],
  "citasExperto": [
    "Cita textual o paráfrasis fiel que captura un insight técnico clave",
    "Otra cita con perspectiva estratégica relevante"
  ],
  "recommendations": [
    "Implicación estratégica o de diseño concreta basada en el conocimiento del experto",
    "Segunda recomendación accionable para el equipo",
    "Tercera recomendación"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- Los insights deben ser profundos y aprovechar el conocimiento técnico especializado del experto — buscar perspectivas que no se pueden obtener de fuentes públicas.
- Las citasExperto deben ser reveladoras y capturar el saber experto, no generalidades. Si hay citas técnicas registradas, priorizalas.
- Mínimo 3 insights, 2 tendencias, 2 barreras, 2 oportunidades, 2 citas, 3 recommendations.
- Las recommendations deben ser accionables y estar fundadas en el conocimiento técnico compartido por el experto, no en suposiciones genéricas.`;
  }

  private formatData(dto: EntrevistaExpertoAnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== ENTREVISTA CON EXPERTO ==='];

    if (data.experto) lines.push(`Experto: ${data.experto}`);
    if (data.experticia) lines.push(`Área de experticia: ${data.experticia}`);
    if (data.organizacion) lines.push(`Organización: ${data.organizacion}`);
    if (data.cargo) lines.push(`Cargo: ${data.cargo}`);
    if (data.fecha) lines.push(`Fecha: ${data.fecha}`);
    if (data.objetivos)
      lines.push(`\nObjetivos de la entrevista:\n${data.objetivos}`);

    if (data.respuestas?.length) {
      lines.push('\n--- PREGUNTAS Y RESPUESTAS ---');
      for (let i = 0; i < data.respuestas.length; i++) {
        const r = data.respuestas[i];
        if (!r.pregunta && !r.respuesta) continue;
        lines.push(`\nP${i + 1}: ${r.pregunta || '(pregunta no registrada)'}`);
        lines.push(`R: ${r.respuesta || '(sin respuesta)'}`);
      }
    }

    if (data.citasTecnicas?.length) {
      lines.push('\n--- CITAS TÉCNICAS DESTACADAS ---');
      data.citasTecnicas.forEach((c) => lines.push(`"${c}"`));
    }

    if (data.observaciones) {
      lines.push(
        `\n--- OBSERVACIONES Y CONTEXTO ADICIONAL ---\n${data.observaciones}`,
      );
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
