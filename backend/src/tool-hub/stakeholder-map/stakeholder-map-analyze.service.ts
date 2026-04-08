import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import {
  StakeholderMapAnalyzeReqDto,
  StakeholderItemDto,
} from './dto/stakeholder-map-analyze.req.dto';
import {
  StakeholderMapAnalyzeResDto,
  StakeholderMapReportDto,
} from './dto/stakeholder-map-analyze.res.dto';
import {
  buildProjectContextSection,
  ProjectBriefContext,
} from '../shared/project-context';

@Injectable()
export class StakeholderMapAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(
    dto: StakeholderMapAnalyzeReqDto,
    currentVersion: number,
  ): Promise<StakeholderMapAnalyzeResDto> {
    const { tool, project } = await this.loadContext(dto.toolApplicationId);
    const systemPrompt = this.buildSystemPrompt(tool, project);
    const dataText = this.formatCuadrantes(dto);

    const raw = await this.aiService.chat(
      [
        {
          role: 'user',
          content: `${dataText}\n\nGenerá el informe en JSON ahora.`,
        },
      ],
      systemPrompt,
      2048,
    );

    let report: StakeholderMapReportDto;
    try {
      report = JSON.parse(this.extractJson(raw));
    } catch {
      throw new UnprocessableEntityException(
        'La respuesta del AI no es JSON válido',
      );
    }

    return {
      version: currentVersion + 1,
      generatedAt: new Date().toISOString(),
      report,
    };
  }

  private buildSystemPrompt(
    tool: { nombre: string; descripcion: string; comoSeUsa: string | null },
    project: ProjectBriefContext,
  ): string {
    const projectSection = buildProjectContextSection(project);

    return `Sos un experto en gestión de stakeholders y Design Thinking con más de 15 años de experiencia en proyectos de innovación y diseño centrado en el usuario.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá el Stakeholder Map proporcionado (clasificado en la matriz Poder/Interés) y generá un informe estratégico en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "párrafo de 3-4 oraciones que sintetiza el ecosistema de stakeholders y los hallazgos más importantes",
  "quadrantAnalysis": {
    "manage-closely": {
      "actoresClave": ["nombre o tipo de actor destacado 1", "nombre o tipo de actor destacado 2"],
      "dinamica": "observación sobre la dinámica de este cuadrante (1-2 oraciones)",
      "accionesRecomendadas": ["acción concreta 1", "acción concreta 2"]
    },
    "keep-satisfied": {
      "actoresClave": ["actor 1"],
      "dinamica": "observación sobre la dinámica de este cuadrante",
      "accionesRecomendadas": ["acción concreta 1"]
    },
    "keep-informed": {
      "actoresClave": ["actor 1"],
      "dinamica": "observación sobre la dinámica de este cuadrante",
      "accionesRecomendadas": ["acción concreta 1"]
    },
    "monitor": {
      "actoresClave": ["actor 1"],
      "dinamica": "observación sobre la dinámica de este cuadrante",
      "accionesRecomendadas": ["acción concreta 1"]
    }
  },
  "alianzasEstrategicas": ["alianza potencial 1 entre actores", "alianza potencial 2"],
  "riesgosRelacionales": ["riesgo 1 derivado de las relaciones entre stakeholders", "riesgo 2"],
  "recommendations": ["recomendación estratégica accionable 1", "recomendación estratégica accionable 2", "recomendación estratégica accionable 3"]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- Si un cuadrante está vacío, en "dinamica" indicá "Cuadrante sin actores identificados" y dejá arrays vacíos.
- alianzasEstrategicas identifica posibles coaliciones o alineamientos entre actores de distintos cuadrantes.
- riesgosRelacionales identifica actores que podrían bloquear el proyecto o generar conflictos.
- recommendations están ordenadas por impacto estratégico.`;
  }

  private formatCuadrantes(dto: StakeholderMapAnalyzeReqDto): string {
    const formatActores = (actores: StakeholderItemDto[]) =>
      actores.length
        ? actores
            .map(
              (a, i) =>
                `  ${i + 1}. ${a.nombre} (${a.tipo})${a.descripcion ? ` — ${a.descripcion}` : ''}`,
            )
            .join('\n')
        : '  (sin actores identificados)';

    return `=== MANAGE CLOSELY (Poder Alto + Interés Alto) ===
Estrategia: Involucrar activamente en decisiones
${formatActores(dto.cuadrantes['manage-closely'])}

=== KEEP SATISFIED (Poder Alto + Interés Bajo) ===
Estrategia: Mantener satisfechos, evitar sorpresas
${formatActores(dto.cuadrantes['keep-satisfied'])}

=== KEEP INFORMED (Poder Bajo + Interés Alto) ===
Estrategia: Informar regularmente, escuchar feedback
${formatActores(dto.cuadrantes['keep-informed'])}

=== MONITOR (Poder Bajo + Interés Bajo) ===
Estrategia: Observar, mínimo esfuerzo de comunicación
${formatActores(dto.cuadrantes['monitor'])}`.trim();
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
