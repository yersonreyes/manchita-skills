import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { VisitaCampoAnalyzeReqDto, VisitaDto } from './dto/visita-campo-analyze.req.dto';
import { VisitaCampoAnalyzeResDto, VisitaCampoReportDto } from './dto/visita-campo-analyze.res.dto';
import { buildProjectContextSection, ProjectBriefContext } from '../shared/project-context';

const TIPO_LABELS: Record<string, string> = {
  observar: 'Observación',
  preguntar: 'Pregunta/Respuesta',
  experimentar: 'Experimentación',
  documentar: 'Documentación',
};

@Injectable()
export class VisitaCampoAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(dto: VisitaCampoAnalyzeReqDto): Promise<VisitaCampoAnalyzeResDto> {
    const { tool, project } = await this.loadContext(dto.toolApplicationId);
    const systemPrompt = this.buildSystemPrompt(tool, project);
    const dataText = this.formatData(dto);

    const raw = await this.aiService.chat(
      [{ role: 'user', content: `${dataText}\n\nGenerá el análisis en JSON ahora.` }],
      systemPrompt,
      2048,
    );

    let report: VisitaCampoReportDto;
    try {
      report = JSON.parse(this.extractJson(raw)) as VisitaCampoReportDto;
    } catch {
      console.error('[VisitaCampoAnalyzeService] Raw AI response:', raw);
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

    return `Sos un experto en investigación de campo, etnografía aplicada al diseño y análisis de contextos de uso reales.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá los hallazgos de las visitas de campo documentadas y generá un análisis de insights en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 3-4 oraciones: cuántas visitas se realizaron, qué lugares se visitaron, cuántos hallazgos se documentaron, y cuál es el insight más importante que el contexto real revela sobre el problema o la oportunidad.",
  "hallazgosDestacados": [
    {
      "visita": "Nombre o lugar de la visita",
      "tipo": "Observación / Pregunta-Respuesta / Experimentación / Documentación",
      "observacion": "El hallazgo específico — lo que se vio, preguntó o experimentó",
      "insight": "Qué revela este hallazgo sobre el usuario, el contexto o el problema"
    }
  ],
  "patronesContextuales": [
    "Patrón que emerge al observar múltiples visitas o situaciones — algo que se repite o que contrasta significativamente",
    "Segundo patrón con énfasis en cómo el contexto físico o social afecta el comportamiento",
    "Tercer patrón relevante"
  ],
  "elementosInvisibles": [
    "Algo que el usuario hace o que existe en el contexto que NO hubiera surgido en una entrevista — demasiado obvio para ellos o fuera de su conciencia",
    "Segundo elemento invisible con qué implica para el diseño",
    "Tercer elemento relevante"
  ],
  "workaroundsEncontrados": [
    "Solución improvisada que el usuario o el entorno usa para resolver un problema no resuelto — describí el problema original y la adaptación encontrada",
    "Segundo workaround con qué oportunidad de diseño abre"
  ],
  "painPointsCriticos": [
    "Pain point observado directamente en el campo — validado por comportamiento real, no auto-reportado",
    "Segundo pain point con contexto de cuándo y cómo afecta al usuario o proceso",
    "Tercer pain point prioritario"
  ],
  "insightsDeContexto": [
    "Insight sobre el contexto que cambia la manera de pensar el problema — algo que no se ve desde la oficina",
    "Segundo insight sobre cómo el entorno físico, social o temporal afecta el uso o la experiencia",
    "Tercer insight relevante"
  ],
  "oportunidades": [
    "Oportunidad de diseño concreta derivada de los hallazgos de campo — fundamentada en evidencia real, no en supuestos",
    "Segunda oportunidad con por qué el contexto la hace viable o urgente",
    "Tercera oportunidad priorizada"
  ],
  "recommendations": [
    "Recomendación accionable que responde directamente a lo observado en campo",
    "Segunda recomendación concreta para el equipo de diseño",
    "Tercera recomendación estratégica de más largo plazo"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- Los elementos invisibles son el corazón de la visita de campo — son lo que los usuarios no mencionan en entrevistas porque es "demasiado obvio" para ellos.
- Los hallazgos de experimentación (cuando el equipo hizo la tarea ellos mismos) son especialmente valiosos — priorizalos si están documentados.
- Los patrones contextuales son lo que se ve SOLO cuando estás en el lugar — no en un lab, no en una entrevista.
- Mínimo 3 hallazgosDestacados, 3 patronesContextuales, 2 elementosInvisibles, 2 workaroundsEncontrados, 3 painPointsCriticos, 2 insightsDeContexto, 2 oportunidades, 3 recommendations.`;
  }

  private formatData(dto: VisitaCampoAnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== VISITA DE CAMPO ==='];

    if (data.objetivo) lines.push(`Objetivo: ${data.objetivo}`);
    if (data.guiaVisita) lines.push(`Guía de visita: ${data.guiaVisita}`);

    if (data.visitas?.length) {
      lines.push(`\n--- VISITAS REALIZADAS (${data.visitas.length}) ---`);
      for (let i = 0; i < data.visitas.length; i++) {
        const v: VisitaDto = data.visitas[i];
        lines.push(`\n[VISITA ${i + 1}]${v.lugar ? ` ${v.lugar}` : ''}`);
        if (v.fecha) lines.push(`Fecha: ${v.fecha}`);
        if (v.duracion) lines.push(`Duración: ${v.duracion}`);
        if (v.equipo) lines.push(`Equipo: ${v.equipo}`);
        if (v.hallazgos?.length) {
          lines.push(`Hallazgos (${v.hallazgos.length}):`);
          v.hallazgos.forEach(h => {
            const tipoLabel = TIPO_LABELS[h.tipo ?? ''] ?? h.tipo ?? '';
            const parts: string[] = [];
            if (tipoLabel) parts.push(`[${tipoLabel}]`);
            if (h.observacion) parts.push(h.observacion);
            if (h.insight) parts.push(`→ ${h.insight}`);
            if (parts.length > 0) lines.push(`  • ${parts.join(' ')}`);
          });
        }
        if (v.notas) lines.push(`Notas: ${v.notas}`);
      }
    }

    if (data.sintesis) {
      lines.push(`\n--- SÍNTESIS DEL EQUIPO ---\n${data.sintesis}`);
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
