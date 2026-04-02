import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { KeyFactsAnalyzeReqDto, KeyFactItemDto } from './dto/key-facts-analyze.req.dto';
import { KeyFactsAnalyzeResDto, KeyFactsReportDto } from './dto/key-facts-analyze.res.dto';
import { buildProjectContextSection, ProjectBriefContext } from '../shared/project-context';

@Injectable()
export class KeyFactsAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(dto: KeyFactsAnalyzeReqDto): Promise<KeyFactsAnalyzeResDto> {
    const { tool, project } = await this.loadContext(dto.toolApplicationId);
    const systemPrompt = this.buildSystemPrompt(tool, project);
    const dataText = this.formatData(dto);

    const raw = await this.aiService.chat(
      [{ role: 'user', content: `${dataText}\n\nGenerá el análisis en JSON ahora.` }],
      systemPrompt,
      2048,
    );

    let report: KeyFactsReportDto;
    try {
      report = JSON.parse(this.extractJson(raw)) as KeyFactsReportDto;
    } catch {
      console.error('[KeyFactsAnalyzeService] Raw AI response:', raw);
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

    return `Sos un experto en síntesis de investigación, análisis de datos cualitativos y cuantitativos, y traducción de hallazgos en decisiones de diseño. Conocés en profundidad cómo separar facts de interpretaciones, cómo identificar patrones entre datos aparentemente dispares, y cómo convertir hechos verificables en oportunidades estratégicas.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá los Key Facts documentados y generá un análisis estratégico en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 3-4 oraciones: qué investigación se realizó, cuántos hechos se documentaron, cuál es el patrón dominante que emerge del conjunto de datos, y cuál es el hallazgo más crítico para las decisiones de diseño.",
  "patronesIdentificados": [
    "Patrón que se repite en múltiples facts — una tendencia clara que los datos revelan",
    "Segundo patrón sobre comportamientos, problemas o oportunidades que aparecen de forma consistente",
    "Tercer patrón relevante para las decisiones del equipo"
  ],
  "factsDestacados": [
    "El hecho más impactante con explicación de por qué es el más relevante para el diseño",
    "Segundo hecho clave que debería informar decisiones prioritarias",
    "Tercer hecho que tiene mayor potencial de cambio si se actúa sobre él"
  ],
  "tensionesYContradicciones": [
    "Tensión o contradicción entre dos o más facts — datos que apuntan en direcciones opuestas",
    "Segunda tensión que requiere investigación adicional o una decisión de diseño explícita",
    "Tercera contradicción o dato sorprendente que desafía hipótesis del equipo"
  ],
  "implicacionesEstrategicas": [
    "Lo que los datos en conjunto implican para la dirección del producto o servicio",
    "Segunda implicación sobre el stack de prioridades — qué debe subir o bajar",
    "Tercera implicación sobre riesgos o compromisos que los datos revelan"
  ],
  "oportunidadesDeDiseno": [
    "Oportunidad concreta de diseño que emerge directamente de los facts documentados",
    "Segunda oportunidad con el tipo de intervención recomendada (feature, flujo, contenido, etc.)",
    "Tercera oportunidad derivada de las implicaciones de los datos"
  ],
  "recommendations": [
    "Acción concreta que el equipo debería tomar basada en el análisis",
    "Recomendación sobre qué investigación adicional se necesita para cubrir gaps en los datos",
    "Recomendación sobre cómo usar estos facts para alinear stakeholders en las próximas decisiones"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- Los factsDestacados deben referenciar hechos específicos de los datos provistos.
- Las tensionesYContradicciones son obligatorias — si los datos parecen consistentes, identificá las tensiones implícitas.
- Mínimo 3 items en patronesIdentificados, factsDestacados, tensionesYContradicciones, implicacionesEstrategicas, oportunidadesDeDiseno, recommendations.`;
  }

  private formatData(dto: KeyFactsAnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== KEY FACTS ==='];

    if (data.contexto) lines.push(`Contexto de la investigación: ${data.contexto}`);
    lines.push(`Total de hechos documentados: ${data.facts.length}`);

    const factsConDesc = data.facts.filter(f => f.descripcion?.trim());
    lines.push(`Hechos con descripción: ${factsConDesc.length}`);

    for (let i = 0; i < data.facts.length; i++) {
      const fact: KeyFactItemDto = data.facts[i];
      if (!fact.descripcion?.trim()) continue;
      lines.push(`\n--- HECHO ${i + 1} ---`);
      lines.push(`Dato: ${fact.descripcion}`);
      if (fact.fuente?.trim()) lines.push(`Fuente: ${fact.fuente}`);
      if (fact.implicacion?.trim()) lines.push(`Implicación declarada: ${fact.implicacion}`);
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
