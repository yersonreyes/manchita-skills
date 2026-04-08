import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { InvestigacionRemotaAnalyzeReqDto } from './dto/investigacion-remota-analyze.req.dto';
import {
  InvestigacionRemotaAnalyzeResDto,
  InvestigacionRemotaReportDto,
} from './dto/investigacion-remota-analyze.res.dto';
import {
  buildProjectContextSection,
  ProjectBriefContext,
} from '../shared/project-context';

const TIPO_LABELS: Record<string, string> = {
  encuesta: 'Encuesta Online',
  'entrevista-video': 'Entrevista por Video',
  'diary-study': 'Diary Study',
  testing: 'Unmoderated Testing',
  'card-sorting': 'Card Sorting',
  'tree-testing': 'Tree Testing',
  otro: 'Otro',
};

@Injectable()
export class InvestigacionRemotaAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(
    dto: InvestigacionRemotaAnalyzeReqDto,
  ): Promise<InvestigacionRemotaAnalyzeResDto> {
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

    let report: InvestigacionRemotaReportDto;
    try {
      report = JSON.parse(
        this.extractJson(raw),
      ) as InvestigacionRemotaReportDto;
    } catch {
      console.error(
        '[InvestigacionRemotaAnalyzeService] Raw AI response:',
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

    return `Sos un experto en investigación de usuarios, investigación remota y síntesis de insights de diseño.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá los métodos y hallazgos de investigación remota documentados y generá un análisis de insights de diseño en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 3-4 oraciones: qué se investigó, cuántos métodos se usaron, cuál es el hallazgo más importante y qué implica para el diseño.",
  "hallazgosClave": [
    {
      "metodo": "Nombre del método (ej: Encuesta Online, Entrevista por Video)",
      "hallazgo": "El hallazgo más importante de este método — específico, con datos si los hay",
      "implicancia": "Qué implica para el diseño o la estrategia del producto"
    }
  ],
  "patronesEncontrados": [
    "Patrón que emerge de múltiples métodos o participantes — describilo con precisión",
    "Segundo patrón con contexto sobre cuándo y quiénes lo muestran",
    "Tercer patrón relevante"
  ],
  "insightsAccionables": [
    "Insight: lo que los datos revelan sobre el usuario o el problema — más allá de lo obvio",
    "Segundo insight profundo derivado de los hallazgos",
    "Tercer insight con implicancia de diseño"
  ],
  "limitacionesDetectadas": [
    "Limitación del método o del proceso de investigación que afecta la confiabilidad de los datos",
    "Segunda limitación con qué tipo de investigación complementaria se recomienda"
  ],
  "oportunidades": [
    "Oportunidad de diseño concreta que emerge de los hallazgos — específica y accionable",
    "Segunda oportunidad con qué problema del usuario resuelve",
    "Tercera oportunidad priorizada"
  ],
  "recommendations": [
    "Recomendación concreta para el equipo de diseño basada en la evidencia",
    "Segunda recomendación accionable",
    "Tercera recomendación"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- Los insights deben ir más allá de los datos — buscá el significado detrás de los números y respuestas.
- Si hay múltiples métodos, buscá convergencias y divergencias entre ellos.
- Mínimo 1 hallazgoClave por método documentado, 3 patronesEncontrados, 3 insightsAccionables, 1 limitacion, 2 oportunidades, 3 recommendations.
- Las recomendaciones deben derivar directamente de la evidencia.`;
  }

  private formatData(dto: InvestigacionRemotaAnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== INVESTIGACIÓN REMOTA ==='];

    if (data.objetivo) lines.push(`Objetivo general: ${data.objetivo}`);
    if (data.contexto) lines.push(`Contexto: ${data.contexto}`);
    if (data.fechas) lines.push(`Fechas: ${data.fechas}`);
    if (data.equipo) lines.push(`Equipo: ${data.equipo}`);

    if (data.metodos?.length) {
      lines.push(`\n--- MÉTODOS DE INVESTIGACIÓN (${data.metodos.length}) ---`);
      for (let i = 0; i < data.metodos.length; i++) {
        const m = data.metodos[i];
        const tipoLabel = TIPO_LABELS[m.tipo ?? ''] ?? m.tipo ?? 'Método';
        lines.push(`\n[MÉTODO ${i + 1}] ${tipoLabel}`);
        if (m.herramienta) lines.push(`Herramienta: ${m.herramienta}`);
        if (m.participantes) lines.push(`Participantes: ${m.participantes}`);
        if (m.objetivo) lines.push(`Objetivo: ${m.objetivo}`);
        if (m.hallazgos?.length) {
          lines.push(`Hallazgos (${m.hallazgos.length}):`);
          m.hallazgos.forEach((h) => lines.push(`  • ${h}`));
        }
        if (m.notas) lines.push(`Notas: ${m.notas}`);
      }
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
