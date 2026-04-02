import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { PovAnalyzeReqDto } from './dto/pov-analyze.req.dto';
import { PovAnalyzeResDto, PovReportDto } from './dto/pov-analyze.res.dto';
import { buildProjectContextSection, ProjectBriefContext } from '../shared/project-context';

@Injectable()
export class PovAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(dto: PovAnalyzeReqDto): Promise<PovAnalyzeResDto> {
    const { tool, project } = await this.loadContext(dto.toolApplicationId);
    const systemPrompt = this.buildSystemPrompt(tool, project);
    const dataText = this.formatData(dto);

    const raw = await this.aiService.chat(
      [{ role: 'user', content: `${dataText}\n\nGenerá el análisis en JSON ahora.` }],
      systemPrompt,
      2048,
    );

    let report: PovReportDto;
    try {
      report = JSON.parse(this.extractJson(raw)) as PovReportDto;
    } catch {
      console.error('[PovAnalyzeService] Raw AI response:', raw);
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

    return `Sos un experto en Design Thinking, síntesis de investigación y formulación de POV (Point of View) según la metodología de la d.school de Stanford. Tu especialidad es evaluar la calidad de las declaraciones de punto de vista, derivar preguntas How Might We accionables, y guiar al equipo hacia el problema correcto antes de idear.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá los POVs documentados y generá un análisis profundo con derivación de HMW en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 3-4 oraciones: cuántos POVs se definieron, qué usuario(s) se están priorizando, cuál es el núcleo del problema que emerge, y si los POVs están bien fundamentados en research.",
  "analisisPorPov": [
    {
      "enunciado": "El POV reformulado de manera clara y precisa: [usuario] necesita [necesidad] porque [insight].",
      "fortaleza": "Qué hace bien este POV — especificidad del usuario, claridad de la necesidad, profundidad del insight.",
      "oportunidadMejora": "Qué le falta o cómo podría fortalecerse — más especificidad, insight más sorprendente, etc.",
      "hmwSugeridos": [
        "¿Cómo podríamos [acción específica derivada del POV]?",
        "¿Cómo podríamos [variación del HMW con diferente angulación]?",
        "¿Cómo podríamos [HMW que abre espacio creativo sin definir la solución]?"
      ]
    }
  ],
  "povMasAccionable": "Cita textual del POV con mayor claridad y potencial para guiar la ideación — explicá en 1 oración por qué es el más accionable.",
  "hmwPrioritarios": [
    "¿Cómo podríamos [el HMW más importante que emerge de todos los POVs — específico y accionable]?",
    "¿Cómo podríamos [segundo HMW prioritario con diferente angulación]?",
    "¿Cómo podríamos [tercer HMW que abra espacio creativo sin resolver por adelantado]?"
  ],
  "tensionesIdentificadas": [
    "Tensión o contradicción entre POVs o dentro de un POV que el equipo debería resolver — explicá el dilema",
    "Segunda tensión si existe"
  ],
  "recommendations": [
    "Acción concreta para el equipo de diseño antes de empezar a idear — basada en el análisis de los POVs",
    "Segunda recomendación con impacto en el proceso de diseño",
    "Tercera recomendación para fortalecer o validar los POVs"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- El "analisisPorPov" debe tener una entrada por cada POV documentado.
- Los HMW deben ser: específicos pero no resolutivos, accionables, abiertos a múltiples soluciones.
- Un buen HMW NO incluye la solución en la pregunta — eso limita la ideación.
- Los "tensionesIdentificadas" son dilemas reales, no observaciones genéricas.
- Mínimo 3 hmwPrioritarios, 3 recommendations.
- Si hay solo 1 POV, el "tensionesIdentificadas" puede estar vacío [].`;
  }

  private formatData(dto: PovAnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== POINT OF VIEW ==='];

    if (data.contexto) lines.push(`Contexto de investigación: ${data.contexto}`);

    if (data.povs?.length) {
      lines.push(`\nTotal de POVs definidos: ${data.povs.length}`);
      data.povs.forEach((pov, i) => {
        lines.push(`\n--- POV ${i + 1} ---`);
        if (pov.usuario) lines.push(`Usuario: ${pov.usuario}`);
        if (pov.necesidad) lines.push(`Necesidad: ${pov.necesidad}`);
        if (pov.insight) lines.push(`Insight: ${pov.insight}`);
        if (pov.usuario && pov.necesidad && pov.insight) {
          lines.push(`Enunciado completo: "${pov.usuario} necesita ${pov.necesidad} porque ${pov.insight}."`);
        }
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
