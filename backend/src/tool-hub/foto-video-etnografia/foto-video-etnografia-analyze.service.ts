import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { FotoVideoEtnografiaAnalyzeReqDto } from './dto/foto-video-etnografia-analyze.req.dto';
import {
  FotoVideoEtnografiaAnalyzeResDto,
  FotoVideoEtnografiaReportDto,
} from './dto/foto-video-etnografia-analyze.res.dto';
import {
  buildProjectContextSection,
  ProjectBriefContext,
} from '../shared/project-context';

@Injectable()
export class FotoVideoEtnografiaAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(
    dto: FotoVideoEtnografiaAnalyzeReqDto,
  ): Promise<FotoVideoEtnografiaAnalyzeResDto> {
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

    let report: FotoVideoEtnografiaReportDto;
    try {
      report = JSON.parse(
        this.extractJson(raw),
      ) as FotoVideoEtnografiaReportDto;
    } catch {
      console.error(
        '[FotoVideoEtnografiaAnalyzeService] Raw AI response:',
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

    return `Sos un experto en investigación etnográfica, investigación de campo visual y análisis de datos cualitativos.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá los registros de foto-vídeo etnografía documentados y generá un análisis de insights de diseño en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 3-4 oraciones: qué contexto se investigó, cuántos registros se documentaron, cuáles son los hallazgos más relevantes para el diseño.",
  "patronesPrincipales": [
    "Patrón visual o comportamental que aparece en múltiples registros — describilo con precisión etnográfica",
    "Segundo patrón con contexto de cuándo y dónde emerge",
    "Tercer patrón relevante para el diseño"
  ],
  "insights": [
    {
      "categoria": "Comportamiento / Contexto / Objeto / Workaround / Emoción / Sistema",
      "insight": "El insight: qué revela este material visual sobre cómo vive, trabaja o se relaciona el usuario con el problema que estamos diseñando.",
      "evidencia": "Descripción específica del registro visual que sustenta este insight (qué foto/video lo evidencia)."
    }
  ],
  "contextoUsuario": "Descripción de 2-3 oraciones del entorno físico y social del usuario tal como emerge de los registros. ¿Cómo es el escenario donde ocurre la experiencia?",
  "workaroundsDetectados": [
    "Improvisación, parche o solución informal que el usuario construyó para resolver un problema — describilo con detalle",
    "Otro workaround con el problema subyacente que revela"
  ],
  "citasVisualesDestacadas": [
    "Descripción de un registro visual que captura un insight poderoso — como si lo estuvieras narrando a alguien que no lo vio",
    "Otro momento visual revelador"
  ],
  "oportunidades": [
    "Oportunidad de diseño concreta que emerge de los hallazgos etnográficos",
    "Segunda oportunidad con qué problema resolvería",
    "Tercera oportunidad accionable"
  ],
  "recommendations": [
    "Implicación de diseño concreta basada en los hallazgos visuales",
    "Segunda recomendación accionable para el equipo de diseño",
    "Tercera recomendación"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- Los insights etnográficos deben ir más allá de lo obvio — buscá el significado cultural y contextual de lo que se documentó.
- Los workarounds son especialmente valiosos: indican dónde el sistema actual falla al usuario.
- Mínimo 3 patronesPrincipales, 3 insights, 1 workaround, 2 citasVisualesDestacadas, 2 oportunidades, 3 recommendations.
- Las recommendations deben ser accionables y derivar directamente de la evidencia visual.`;
  }

  private formatData(dto: FotoVideoEtnografiaAnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== FOTO-VÍDEO ETNOGRAFÍA ==='];

    if (data.objetivo) lines.push(`Objetivo de campo: ${data.objetivo}`);
    if (data.contexto) lines.push(`Contexto / escenario: ${data.contexto}`);
    if (data.fechasSalida) lines.push(`Fechas de salida: ${data.fechasSalida}`);
    if (data.equipo) lines.push(`Equipo: ${data.equipo}`);

    if (data.registros?.length) {
      lines.push(`\n--- REGISTROS VISUALES (${data.registros.length}) ---`);
      for (let i = 0; i < data.registros.length; i++) {
        const r = data.registros[i];
        if (!r.observacion && !r.titulo) continue;
        lines.push(
          `\n[${r.tipo?.toUpperCase() ?? 'FOTO'} ${i + 1}] ${r.titulo || '(sin título)'}`,
        );
        if (r.lugar) lines.push(`Lugar: ${r.lugar}`);
        if (r.sujeto) lines.push(`Sujeto: ${r.sujeto}`);
        if (r.observacion) lines.push(`Observación: ${r.observacion}`);
        if (r.insight) lines.push(`Insight registrado: ${r.insight}`);
      }
    }

    if (data.patronesVisuales) {
      lines.push(
        `\n--- PATRONES VISUALES (registrado en campo) ---\n${data.patronesVisuales}`,
      );
    }

    if (data.citasVisuales?.length) {
      lines.push('\n--- MOMENTOS CLAVE CAPTURADOS ---');
      data.citasVisuales.forEach((c) => lines.push(`• ${c}`));
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
