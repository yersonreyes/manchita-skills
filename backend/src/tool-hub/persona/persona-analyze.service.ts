import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { PersonaAnalyzeReqDto } from './dto/persona-analyze.req.dto';
import { PersonaAnalyzeResDto, PersonaReportDto } from './dto/persona-analyze.res.dto';
import { buildProjectContextSection, ProjectBriefContext } from '../shared/project-context';

@Injectable()
export class PersonaAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(dto: PersonaAnalyzeReqDto): Promise<PersonaAnalyzeResDto> {
    const { tool, project } = await this.loadContext(dto.toolApplicationId);
    const systemPrompt = this.buildSystemPrompt(tool, project);
    const dataText = this.formatData(dto);

    const raw = await this.aiService.chat(
      [{ role: 'user', content: `${dataText}\n\nGenerá el informe en JSON ahora.` }],
      systemPrompt,
      2048,
    );

    let report: PersonaReportDto;
    try {
      report = JSON.parse(this.extractJson(raw));
    } catch (err) {
      console.error('[PersonaAnalyzeService] Raw AI response that failed to parse:', raw);
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

    return `Sos un experto en UX Research y Design Thinking especializado en User Personas.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá el perfil de persona que se te proporciona y generá un informe estratégico en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "párrafo de 3-4 oraciones que sintetiza quién es esta persona, qué la motiva y qué la frena — orientado a decisiones de diseño",
  "insightsDeDiseno": ["insight 1 concreto y aplicable a decisiones de diseño", "insight 2", "insight 3"],
  "oportunidades": ["oportunidad de diseño o producto derivada del perfil 1", "oportunidad 2"],
  "recommendations": ["acción concreta de diseño o producto 1", "acción concreta 2", "acción concreta 3"]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto adicional antes ni después.
- Los insights son observaciones sobre el perfil que impactan directamente en decisiones de diseño (lenguaje, flujos, features, canales).
- Las oportunidades son gaps o necesidades no cubiertas que emergen del perfil.
- Las recommendations son acciones específicas y accionables para el equipo de diseño/producto.
- Si algún campo del perfil está vacío, inferí razonablemente desde los demás datos.
- Respondés en español.`;
  }

  private formatData(dto: PersonaAnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== PERFIL DE PERSONA ==='];

    if (data.nombre) lines.push(`Nombre: ${data.nombre}${data.apodo ? ` — "${data.apodo}"` : ''}`);
    if (data.tipo) lines.push(`Tipo: ${data.tipo}`);

    const demo: string[] = [];
    if (data.edad) demo.push(`${data.edad} años`);
    if (data.profesion) demo.push(data.profesion);
    if (data.ubicacion) demo.push(data.ubicacion);
    if (data.ingresos) demo.push(`Ingresos: ${data.ingresos}`);
    if (demo.length) lines.push(`Demográficos: ${demo.join(' | ')}`);

    if (data.bio) lines.push(`\nBiografía:\n${data.bio}`);

    if (data.motivaciones?.length) {
      lines.push(`\nMotivaciones:\n${data.motivaciones.map((m) => `- ${m}`).join('\n')}`);
    }
    if (data.frustraciones?.length) {
      lines.push(`\nFrustraciones / Pain Points:\n${data.frustraciones.map((f) => `- ${f}`).join('\n')}`);
    }
    if (data.comportamiento) lines.push(`\nComportamiento / Tecnología:\n${data.comportamiento}`);
    if (data.cita) lines.push(`\nCita representativa: "${data.cita}"`);

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
