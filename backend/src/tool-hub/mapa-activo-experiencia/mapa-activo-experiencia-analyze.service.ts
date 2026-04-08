import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { MapaActivoExperienciaAnalyzeReqDto } from './dto/mapa-activo-experiencia-analyze.req.dto';
import {
  MapaActivoExperienciaAnalyzeResDto,
  MapaActivoReportDto,
} from './dto/mapa-activo-experiencia-analyze.res.dto';
import {
  buildProjectContextSection,
  ProjectBriefContext,
} from '../shared/project-context';

@Injectable()
export class MapaActivoExperienciaAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(
    dto: MapaActivoExperienciaAnalyzeReqDto,
  ): Promise<MapaActivoExperienciaAnalyzeResDto> {
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

    let report: MapaActivoReportDto;
    try {
      report = JSON.parse(this.extractJson(raw)) as MapaActivoReportDto;
    } catch {
      console.error(
        '[MapaActivoExperienciaAnalyzeService] Raw AI response:',
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

    return `Sos un experto en diseño de experiencias, service design y journey mapping. Tu especialidad es identificar momentos críticos de la experiencia del usuario, los touchpoints que generan mayor impacto y las oportunidades de intervención que pueden transformar la experiencia de manera significativa.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá el mapa de experiencia documentado y generá un análisis profundo de insights y oportunidades en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 3-4 oraciones: cuántas etapas se mapearon, cuál es el arco general de la experiencia, cuáles son los hallazgos más críticos para el diseño.",
  "analisisPorEtapa": [
    {
      "etapa": "Nombre de la etapa exactamente como fue documentada",
      "momentoClave": "El momento más crítico o determinante de esta etapa para la experiencia del usuario",
      "oportunidadPrioritaria": "La oportunidad de diseño más concreta e impactante en esta etapa",
      "implicacion": "Qué debería hacer el equipo de diseño respecto a esta etapa — accionable y específico"
    }
  ],
  "momentosCriticos": [
    "Momento de la experiencia que concentra mayor fricción, frustración o abandono — con nombre de la etapa y descripción del momento",
    "Segundo momento crítico con impacto en la experiencia",
    "Tercer momento crítico si existe"
  ],
  "touchpointsPrioritarios": [
    "Touchpoint con mayor potencial de impacto positivo — explicá por qué es prioritario",
    "Segundo touchpoint prioritario con contexto de cuándo ocurre",
    "Tercer touchpoint con oportunidad clara"
  ],
  "mapaDeOportunidades": [
    "Oportunidad de diseño concreta que emerge del mapa completo — incluí en qué etapa o momento se aplica",
    "Segunda oportunidad con qué problema resolvería",
    "Tercera oportunidad accionable para el equipo"
  ],
  "patronesDeComportamiento": [
    "Patrón que se repite en múltiples etapas o touchpoints — describilo con nombre y qué lo causa",
    "Segundo patrón con implicaciones para el diseño",
    "Tercer patrón si aplica"
  ],
  "recommendations": [
    "Recomendación concreta de diseño derivada del análisis — en qué etapa intervenir y cómo",
    "Segunda recomendación con impacto esperado",
    "Tercera recomendación con criterio de priorización"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- El "analisisPorEtapa" debe tener una entrada por cada etapa documentada.
- Los momentosCriticos son los puntos de quiebre de la experiencia — donde más se pierde o se gana.
- El mapaDeOportunidades debe conectar hallazgos del mapa con acciones concretas de diseño.
- Las recommendations deben ser priorizadas y accionables, no genéricas.
- Mínimo 2 momentosCriticos, 2 touchpointsPrioritarios, 3 mapaDeOportunidades, 2 patronesDeComportamiento, 3 recommendations.`;
  }

  private formatData(dto: MapaActivoExperienciaAnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== MAPA ACTIVO DE LA EXPERIENCIA ==='];

    if (data.contexto) lines.push(`Contexto: ${data.contexto}`);

    if (data.etapas?.length) {
      lines.push(`\nTotal de etapas: ${data.etapas.length}`);
      data.etapas.forEach((etapa, i) => {
        lines.push(
          `\n--- ETAPA ${i + 1}: ${etapa.nombre || '(sin nombre)'} ---`,
        );
        if (etapa.acciones?.length)
          lines.push(`Acciones: ${etapa.acciones.join(', ')}`);
        if (etapa.touchpoints?.length)
          lines.push(`Touchpoints: ${etapa.touchpoints.join(', ')}`);
        if (etapa.momentoClave)
          lines.push(`Momento clave: ${etapa.momentoClave}`);
        if (etapa.oportunidades?.length)
          lines.push(`Oportunidades: ${etapa.oportunidades.join(', ')}`);
      });
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
