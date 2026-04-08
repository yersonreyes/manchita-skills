import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import {
  DiagnosticoIndustriaReqDto,
  DiagnosticoInputsDto,
} from './dto/diagnostico-industria.req.dto';
import {
  DiagnosticoIndustriaResDto,
  DiagnosticoReportDto,
} from './dto/diagnostico-industria.res.dto';
import {
  buildProjectContextSection,
  ProjectBriefContext,
} from '../shared/project-context';

@Injectable()
export class DiagnosticoIndustriaAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(
    dto: DiagnosticoIndustriaReqDto,
  ): Promise<DiagnosticoIndustriaResDto> {
    const { tool, project } = await this.loadContext(dto.toolApplicationId);
    const systemPrompt = this.buildSystemPrompt(tool, project);
    const inputsText = this.formatInputs(dto.inputs);

    const raw = await this.aiService.chat(
      [
        {
          role: 'user',
          content: `Aquí está el diagnóstico de industria para analizar:\n\n${inputsText}\n\nGenerá el informe en JSON ahora.`,
        },
      ],
      systemPrompt,
      2500,
    );

    let report: DiagnosticoReportDto;
    try {
      report = JSON.parse(this.extractJson(raw));
    } catch {
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

    return `Sos un consultor estratégico experto en análisis competitivo y el modelo de las 5 Fuerzas de Porter.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá las observaciones del usuario sobre cada fuerza competitiva y generá un informe en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "3-4 oraciones diagnosticando el atractivo y dinámica competitiva de la industria",
  "forceAnalysis": {
    "rivalidad":       { "intensity": "ALTA",  "analysis": "2-3 oraciones analizando la rivalidad entre competidores", "implications": ["implicación 1 para el proyecto", "implicación 2"] },
    "nuevosEntrantes": { "intensity": "BAJA",  "analysis": "2-3 oraciones sobre barreras de entrada", "implications": ["implicación 1"] },
    "proveedores":     { "intensity": "MEDIA", "analysis": "2-3 oraciones sobre el poder de los proveedores", "implications": ["implicación 1"] },
    "clientes":        { "intensity": "ALTA",  "analysis": "2-3 oraciones sobre el poder de los clientes", "implications": ["implicación 1", "implicación 2"] },
    "sustitutos":      { "intensity": "MEDIA", "analysis": "2-3 oraciones sobre la amenaza de sustitutos", "implications": ["implicación 1"] }
  },
  "industryScore": 6,
  "keyOpportunities": ["oportunidad estratégica 1", "oportunidad estratégica 2"],
  "keyRisks": ["riesgo crítico 1", "riesgo crítico 2"],
  "strategicPosition": "1 párrafo de 2-3 oraciones sobre el posicionamiento estratégico recomendado para el proyecto en este contexto",
  "recommendations": ["acción concreta 1", "acción concreta 2", "acción concreta 3"]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto adicional antes ni después.
- intensity es OBLIGATORIAMENTE uno de: "BAJA", "MEDIA", "ALTA". Sin excepciones.
- industryScore es un entero de 1 a 10 donde 10 = industria muy atractiva (pocas fuerzas hostiles), 1 = industria muy hostil.
- Si una sección está sin completar, inferí razonablemente del contexto disponible. Indicalo en analysis con "Basado en el contexto disponible,...".
- implications tiene entre 1 y 2 items por fuerza. Son consecuencias directas para el proyecto.
- keyOpportunities son 2-3 oportunidades derivadas del análisis (fuerzas débiles que el proyecto puede aprovechar).
- keyRisks son 2-3 riesgos críticos derivados de las fuerzas más intensas.
- strategicPosition conecta explícitamente el diagnóstico de la industria con el proyecto concreto.
- recommendations son acciones concretas y accionables ordenadas por prioridad.
- Respondés en español.`;
  }

  private formatInputs(inputs: DiagnosticoInputsDto): string {
    const fmt = (v?: string) => v?.trim() || '(sin completar)';
    return [
      `=== RIVALIDAD ENTRE COMPETIDORES ===\n${fmt(inputs.rivalidad)}`,
      `=== AMENAZA DE NUEVOS ENTRANTES ===\n${fmt(inputs.nuevosEntrantes)}`,
      `=== PODER DE NEGOCIACIÓN DE PROVEEDORES ===\n${fmt(inputs.proveedores)}`,
      `=== PODER DE NEGOCIACIÓN DE CLIENTES ===\n${fmt(inputs.clientes)}`,
      `=== AMENAZA DE PRODUCTOS SUSTITUTOS ===\n${fmt(inputs.sustitutos)}`,
      `=== TENDENCIAS Y CONTEXTO DEL SECTOR ===\n${fmt(inputs.tendencias)}`,
    ].join('\n\n');
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
