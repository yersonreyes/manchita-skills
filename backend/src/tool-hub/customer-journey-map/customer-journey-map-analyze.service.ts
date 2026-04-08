import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import {
  CustomerJourneyMapAnalyzeReqDto,
  CjmEtapaDto,
} from './dto/customer-journey-map-analyze.req.dto';
import {
  CustomerJourneyMapAnalyzeResDto,
  CustomerJourneyMapReportDto,
} from './dto/customer-journey-map-analyze.res.dto';
import {
  buildProjectContextSection,
  ProjectBriefContext,
} from '../shared/project-context';

@Injectable()
export class CustomerJourneyMapAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(
    dto: CustomerJourneyMapAnalyzeReqDto,
  ): Promise<CustomerJourneyMapAnalyzeResDto> {
    const { tool, project } = await this.loadContext(dto.toolApplicationId);
    const systemPrompt = this.buildSystemPrompt(tool, project);
    const dataText = this.formatData(dto);

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

    let report: CustomerJourneyMapReportDto;
    try {
      report = JSON.parse(this.extractJson(raw)) as CustomerJourneyMapReportDto;
    } catch {
      console.error('[CustomerJourneyMapAnalyzeService] Raw AI response:', raw);
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

    return `Sos un experto en UX Research y Service Design especializado en Customer Journey Maps.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá el Customer Journey Map proporcionado y generá un informe en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis en 3-4 oraciones de la experiencia del usuario: quién es, cuál es el journey, cuáles son los momentos críticos y qué oportunidades clave emergen.",
  "momentosDeLaVerdad": [
    "Descripción del momento donde el usuario toma la decisión más importante del journey",
    "Otro momento crítico donde puede perder o ganar al usuario"
  ],
  "etapasAnalisis": [
    {
      "etapa": "Nombre de la etapa",
      "emocionPredominante": "Emoción más representativa en esa etapa",
      "nivelFriccion": "bajo | medio | alto",
      "insight": "Observación no obvia sobre lo que ocurre en esta etapa y su impacto en el journey"
    }
  ],
  "painPointsCriticos": [
    "Pain point 1 con contexto de en qué etapa ocurre y por qué es crítico",
    "Pain point 2"
  ],
  "oportunidadesPriorizadas": [
    "Oportunidad 1 priorizadas por impacto en la experiencia del usuario",
    "Oportunidad 2"
  ],
  "recommendations": [
    "Acción concreta de diseño 1 — con el impacto esperado",
    "Acción concreta de diseño 2",
    "Acción concreta de diseño 3"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- El "nivelFriccion" debe ser exactamente "bajo", "medio" o "alto" (sin mayúsculas, sin acentos).
- Los "momentosDeLaVerdad" son los puntos donde el usuario decide continuar o abandonar — son el corazón del CJM.
- Los "insights" de cada etapa deben ser no obvios, no repetir los datos del mapa.
- Si alguna etapa no tiene contenido, omitila del etapasAnalisis.
- Mínimo 2 items por sección, máximo 4 (excepto etapasAnalisis que incluye todas las etapas con contenido).`;
  }

  private formatData(dto: CustomerJourneyMapAnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== CUSTOMER JOURNEY MAP ==='];

    if (data.personaje) lines.push(`\nPERSONAJE: ${data.personaje}`);
    if (data.escenario) lines.push(`ESCENARIO: ${data.escenario}`);

    for (const etapa of data.etapas) {
      const etapaLabel = etapa.nombre || '(Sin nombre)';
      lines.push(`\n--- ETAPA: ${etapaLabel} ---`);

      if (etapa.acciones?.length) {
        lines.push('ACCIONES:');
        etapa.acciones.forEach((a) => lines.push(`  • ${a}`));
      }
      if (etapa.emociones?.length) {
        lines.push('EMOCIONES:');
        etapa.emociones.forEach((e) => lines.push(`  • ${e}`));
      }
      if (etapa.touchpoints?.length) {
        lines.push('TOUCHPOINTS:');
        etapa.touchpoints.forEach((t) => lines.push(`  • ${t}`));
      }
      if (etapa.painPoints?.length) {
        lines.push('PAIN POINTS:');
        etapa.painPoints.forEach((p) => lines.push(`  • ${p}`));
      }
      if (etapa.oportunidades?.length) {
        lines.push('OPORTUNIDADES:');
        etapa.oportunidades.forEach((o) => lines.push(`  • ${o}`));
      }
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
