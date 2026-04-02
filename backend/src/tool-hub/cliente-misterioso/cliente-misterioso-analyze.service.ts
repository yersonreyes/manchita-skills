import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { ClienteMisteriosoAnalyzeReqDto, VisitaMisteriosaDto } from './dto/cliente-misterioso-analyze.req.dto';
import { ClienteMisteriosoAnalyzeResDto, ClienteMisteriosoReportDto } from './dto/cliente-misterioso-analyze.res.dto';
import { buildProjectContextSection, ProjectBriefContext } from '../shared/project-context';

const CANAL_LABELS: Record<string, string> = {
  'web': 'Sitio Web',
  'mobile-app': 'App Móvil',
  'tienda': 'Tienda / Punto de Venta',
  'telefono': 'Teléfono / Call Center',
  'otro': 'Otro Canal',
};

const IMPACTO_ORDER: Record<string, number> = { 'alto': 0, 'medio': 1, 'bajo': 2 };

@Injectable()
export class ClienteMisteriosoAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(dto: ClienteMisteriosoAnalyzeReqDto): Promise<ClienteMisteriosoAnalyzeResDto> {
    const { tool, project } = await this.loadContext(dto.toolApplicationId);
    const systemPrompt = this.buildSystemPrompt(tool, project);
    const dataText = this.formatData(dto);

    const raw = await this.aiService.chat(
      [{ role: 'user', content: `${dataText}\n\nGenerá el análisis en JSON ahora.` }],
      systemPrompt,
      2048,
    );

    let report: ClienteMisteriosoReportDto;
    try {
      report = JSON.parse(this.extractJson(raw)) as ClienteMisteriosoReportDto;
    } catch {
      console.error('[ClienteMisteriosoAnalyzeService] Raw AI response:', raw);
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

    return `Sos un experto en Mystery Shopping, UX research y evaluación de experiencia de cliente.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá las visitas de mystery shopping documentadas y generá un informe de evaluación de experiencia en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 3-4 oraciones: qué se evaluó, cuántas visitas se realizaron, cuál es la evaluación general de la experiencia y cuál es el hallazgo más importante.",
  "issuesPriorizados": [
    {
      "issue": "Descripción precisa del problema encontrado — sin ambigüedades",
      "impacto": "Por qué afecta la experiencia del usuario y qué comportamiento genera (abandono, frustración, confusión)",
      "canal": "Canal donde se detectó (Sitio Web, App Móvil, etc.)",
      "prioridad": "#1"
    },
    {
      "issue": "Segundo issue más importante",
      "impacto": "Impacto en la experiencia",
      "canal": "Canal",
      "prioridad": "#2"
    }
  ],
  "patronesDeExperiencia": [
    "Patrón que aparece en múltiples visitas o canales — describilo con precisión",
    "Segundo patrón con cuándo y dónde emerge",
    "Tercer patrón relevante"
  ],
  "fortalezasDetectadas": [
    "Aspecto positivo de la experiencia que vale la pena mantener o potenciar",
    "Segunda fortaleza con por qué funciona bien"
  ],
  "friccionesCriticas": [
    "Fricción que causa abandono o frustración grave — muy específica y accionable",
    "Segunda fricción crítica con el paso exacto donde ocurre"
  ],
  "scorePromedioAnalisis": "Evaluación cualitativa de 1 oración basada en los scores registrados: ej. '3.5/5 — Experiencia funcional pero con fricciones en puntos clave del journey'",
  "oportunidades": [
    "Oportunidad de mejora concreta derivada de los hallazgos — qué cambio generaría el mayor impacto",
    "Segunda oportunidad con qué problema del usuario resuelve",
    "Tercera oportunidad priorizada"
  ],
  "recommendations": [
    "Recomendación de diseño o proceso concreta — qué hacer, no qué evitar",
    "Segunda recomendación con quick win potencial",
    "Tercera recomendación de largo plazo"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- Los issues priorizados deben ordenarse de mayor a menor impacto.
- Las fricciones críticas son las que más probablemente causan abandono o mala experiencia memorable.
- Las fortalezas son oportunidades de refuerzo, no excusas para no mejorar.
- Mínimo 2 issuesPriorizados, 3 patronesDeExperiencia, 1 fortaleza, 2 friccionesCriticas, 2 oportunidades, 3 recommendations.`;
  }

  private formatData(dto: ClienteMisteriosoAnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== CLIENTE MISTERIOSO ==='];

    if (data.objetivo) lines.push(`Objetivo: ${data.objetivo}`);
    if (data.criterios) lines.push(`Criterios de evaluación: ${data.criterios}`);

    if (data.visitas?.length) {
      lines.push(`\n--- VISITAS REALIZADAS (${data.visitas.length}) ---`);
      for (let i = 0; i < data.visitas.length; i++) {
        const v = data.visitas[i];
        const canalLabel = CANAL_LABELS[v.canal ?? ''] ?? v.canal ?? 'Canal desconocido';
        lines.push(`\n[VISITA ${i + 1}] Canal: ${canalLabel}`);
        if (v.fecha) lines.push(`Fecha: ${v.fecha}`);
        if (v.escenario) lines.push(`Escenario: ${v.escenario}`);
        if (v.scoreGeneral) lines.push(`Score general: ${v.scoreGeneral}/5`);

        if (v.pasos?.length) {
          lines.push(`\nPasos realizados (${v.pasos.length}):`);
          v.pasos.forEach((p, pi) => {
            const tiempo = p.tiempoDesc ? ` [${p.tiempoDesc}]` : '';
            const notas = p.notas ? ` — ${p.notas}` : '';
            lines.push(`  ${pi + 1}. ${p.descripcion ?? '(sin descripción)'}${tiempo}${notas}`);
          });
        }

        if (v.issues?.length) {
          const sorted = [...v.issues].sort((a, b) =>
            (IMPACTO_ORDER[a.impacto ?? ''] ?? 2) - (IMPACTO_ORDER[b.impacto ?? ''] ?? 2)
          );
          lines.push(`\nIssues encontrados (${v.issues.length}):`);
          sorted.forEach(issue => {
            const area = issue.area ? ` [${issue.area}]` : '';
            lines.push(`  • [${(issue.impacto ?? 'medio').toUpperCase()}]${area} ${issue.descripcion ?? '(sin descripción)'}`);
          });
        }

        if (v.observaciones) lines.push(`\nObservaciones: ${v.observaciones}`);
      }
    }

    if (data.observacionesGenerales) {
      lines.push(`\n--- OBSERVACIONES GENERALES ---\n${data.observacionesGenerales}`);
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
