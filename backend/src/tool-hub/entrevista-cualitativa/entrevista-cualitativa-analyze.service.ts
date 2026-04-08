import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { EntrevistaCualitativaAnalyzeReqDto } from './dto/entrevista-cualitativa-analyze.req.dto';
import {
  EntrevistaCualitativaAnalyzeResDto,
  EntrevistaCualitativaReportDto,
} from './dto/entrevista-cualitativa-analyze.res.dto';
import {
  buildProjectContextSection,
  ProjectBriefContext,
} from '../shared/project-context';

@Injectable()
export class EntrevistaCualitativaAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(
    dto: EntrevistaCualitativaAnalyzeReqDto,
  ): Promise<EntrevistaCualitativaAnalyzeResDto> {
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

    let report: EntrevistaCualitativaReportDto;
    try {
      report = JSON.parse(
        this.extractJson(raw),
      ) as EntrevistaCualitativaReportDto;
    } catch {
      console.error(
        '[EntrevistaCualitativaAnalyzeService] Raw AI response:',
        raw,
      );
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

    return `Sos un experto en investigación cualitativa, UX Research y análisis de entrevistas en profundidad.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá la entrevista cualitativa registrada y generá un análisis de insights en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 3-4 oraciones: quién es el entrevistado, cuáles son los temas centrales que emergieron, y cuál es el hallazgo más relevante para el proyecto.",
  "perfilEntrevistado": "Descripción concisa del perfil del entrevistado y su relevancia para el proyecto (1-2 oraciones).",
  "insights": [
    {
      "categoria": "Comportamiento / Motivación / Frustración / Necesidad / Actitud / Contexto",
      "insight": "El insight en sí: qué revela esta persona sobre el problema que estamos diseñando.",
      "evidencia": "Cita o paráfrasis de la entrevista que sostiene este insight."
    }
  ],
  "necesidadesDetectadas": [
    "Necesidad concreta que tiene el entrevistado, formulada como un deseo o requerimiento",
    "Otra necesidad con contexto"
  ],
  "painPoints": [
    "Problema, frustración o barrera específica que enfrenta el entrevistado",
    "Otro pain point con impacto en su vida o trabajo"
  ],
  "motivaciones": [
    "Qué lo impulsa, qué valora, qué lo hace tomar decisiones",
    "Otra motivación relevante para el diseño"
  ],
  "citasDestacadas": [
    "Cita textual o paráfrasis fiel que captura un insight importante",
    "Otra cita reveladora"
  ],
  "recommendations": [
    "Implicación de diseño concreta basada en esta entrevista",
    "Segunda recomendación accionable",
    "Tercera recomendación"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- Los insights deben ser profundos y no obvios — buscar el "por qué detrás del qué".
- Las citasDestacadas deben ser reveladoras, no genéricas. Si hay citas clave registradas, priorizalas.
- Mínimo 3 insights, 2 necesidades, 2 pain points, 2 motivaciones, 2 citasDestacadas, 3 recommendations.
- Las recommendations deben ser accionables para el equipo de diseño, no generalidades.`;
  }

  private formatData(dto: EntrevistaCualitativaAnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== ENTREVISTA CUALITATIVA ==='];

    if (data.entrevistado) lines.push(`Entrevistado: ${data.entrevistado}`);
    if (data.perfil) lines.push(`Perfil: ${data.perfil}`);
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

    if (data.citasClave?.length) {
      lines.push('\n--- CITAS CLAVE REGISTRADAS ---');
      data.citasClave.forEach((c) => lines.push(`"${c}"`));
    }

    if (data.observaciones) {
      lines.push(`\n--- OBSERVACIONES GENERALES ---\n${data.observaciones}`);
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
