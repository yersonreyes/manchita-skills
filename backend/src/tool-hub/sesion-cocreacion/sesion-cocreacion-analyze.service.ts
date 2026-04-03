import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { SesionCocreacionAnalyzeReqDto } from './dto/sesion-cocreacion-analyze.req.dto';
import { SesionCocreacionAnalyzeResDto, SesionCocreacionReportDto } from './dto/sesion-cocreacion-analyze.res.dto';
import { buildProjectContextSection, ProjectBriefContext } from '../shared/project-context';

const MODALIDAD_LABELS: Record<string, string> = {
  presencial: 'Presencial',
  remota: 'Remota',
  hibrida: 'Híbrida',
};

const FASE_LABELS: Record<string, string> = {
  'warm-up': 'Warm-up',
  'context-setting': 'Context Setting',
  ideacion: 'Generación de Ideas',
  prototipado: 'Prototipado',
  feedback: 'Presentación y Feedback',
};

@Injectable()
export class SesionCocreacionAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(dto: SesionCocreacionAnalyzeReqDto): Promise<SesionCocreacionAnalyzeResDto> {
    const { tool, project } = await this.loadContext(dto.toolApplicationId);
    const systemPrompt = this.buildSystemPrompt(tool, project);
    const dataText = this.formatData(dto);

    const raw = await this.aiService.chat(
      [{ role: 'user', content: `${dataText}\n\nGenerá el análisis en JSON ahora.` }],
      systemPrompt,
      2048,
    );

    let report: SesionCocreacionReportDto;
    try {
      report = JSON.parse(this.extractJson(raw)) as SesionCocreacionReportDto;
    } catch {
      console.error('[SesionCocreacionAnalyzeService] Raw AI response:', raw);
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

    return `Sos un experto en facilitación de talleres de cocreación, Design Thinking y síntesis de ideas colaborativas. Tu especialidad es analizar sesiones de cocreación: identificar qué ideas tienen mayor potencial de innovación y viabilidad, detectar los patrones que emergieron del grupo, articular las tensiones creativas que se produjeron y definir cuáles son los próximos pasos más estratégicos.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá la sesión de cocreación documentada y generá un análisis estratégico en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 2-3 oraciones: qué se buscaba resolver, cuántas ideas se generaron, qué ideas lideran en votos y cuál es el patrón creativo más importante que emergió del grupo.",
  "ideasDestacadas": [
    {
      "grupo": "Nombre del equipo o grupo que generó la idea",
      "descripcion": "La idea tal como fue documentada",
      "potencialInnovador": "Por qué esta idea tiene potencial innovador — qué problema ataca, qué cambio genera en la experiencia del usuario, por qué es difícil de copiar o ya existe",
      "viabilidad": "Evaluación honesta de viabilidad: ¿es técnicamente factible? ¿tiene barreras de negocio? ¿el equipo puede ejecutarla?"
    }
  ],
  "patronesEmergentes": [
    "Patrón que se repite en múltiples ideas — una dirección en la que el grupo convergió aunque no lo haya verbalizado explícitamente",
    "Segundo patrón — puede ser una tensión, un valor compartido o una solución recurrente",
    "Más patrones si los hay"
  ],
  "tensionesCreativas": [
    "Tensión entre dos ideas o enfoques opuestos que surgió en la sesión — estas tensiones son fuente de innovación si se resuelven bien",
    "Segunda tensión si la hay — puede ser entre simplicidad/complejidad, corto/largo plazo, etc."
  ],
  "oportunidadesDesarrollo": [
    "Oportunidad concreta que emerge de las ideas seleccionadas — qué se puede construir a partir de la síntesis del grupo",
    "Segunda oportunidad — puede ser una combinación de ideas de distintos grupos",
    "Tercera oportunidad si aplica"
  ],
  "recommendations": [
    "Próximo paso inmediato: qué prototipar primero y con qué fidelidad",
    "Cómo mantener el ownership de los participantes en las siguientes fases del proceso",
    "Qué validar con usuarios reales antes de comprometerse con una solución"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- En ideasDestacadas: priorizá las ideas con más votos y/o marcadas como seleccionadas. Si todas tienen 0 votos, analizá todas las que tengan descripción.
- Los patronesEmergentes deben ser insights no obvios — no "el grupo quiere algo simple" sino qué principio subyacente conecta varias ideas.
- Si hay ideas seleccionadas, concentrá el análisis en ellas pero mencioná las tensiones con las no seleccionadas.
- Mínimo 2 ideasDestacadas, 2 patronesEmergentes, 2 tensionesCreativas, 3 recommendations.`;
  }

  private formatData(dto: SesionCocreacionAnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== SESIÓN DE COCREACIÓN ==='];

    if (data.objetivo) lines.push(`\nOBJETIVO:\n"${data.objetivo}"`);

    if (data.modalidad) {
      lines.push(`\nMODALIDAD: ${MODALIDAD_LABELS[data.modalidad] ?? data.modalidad}`);
    }

    if (data.participantes?.length) {
      const total = data.participantes.reduce((sum, p) => sum + p.cantidad, 0);
      lines.push(`\nPARTICIPANTES (${total} en total):`);
      data.participantes.forEach(p => {
        if (p.perfil) lines.push(`  • ${p.cantidad}x ${p.perfil}`);
      });
    }

    if (data.fasesCumplidas?.length) {
      const fasesLabels = data.fasesCumplidas.map(f => FASE_LABELS[f] ?? f);
      lines.push(`\nFASES CUMPLIDAS: ${fasesLabels.join(', ')}`);
    }

    if (data.tecnicasUsadas?.length) {
      lines.push(`TÉCNICAS UTILIZADAS: ${data.tecnicasUsadas.join(', ')}`);
    }

    if (data.ideas?.length) {
      const seleccionadas = data.ideas.filter(i => i.seleccionada);
      const noSeleccionadas = data.ideas.filter(i => !i.seleccionada);
      const ordenadas = [...seleccionadas, ...noSeleccionadas].sort((a, b) => b.votos - a.votos);

      lines.push(`\nIDEAS GENERADAS (${data.ideas.length}):`);
      ordenadas.forEach((idea, i) => {
        const sel = idea.seleccionada ? ' ★ SELECCIONADA' : '';
        lines.push(`\n  ${i + 1}. [${idea.votos} votos]${sel} — ${idea.grupo || 'Sin grupo'}`);
        if (idea.descripcion) lines.push(`     "${idea.descripcion}"`);
      });
    }

    if (data.decisiones?.length) {
      lines.push(`\nDECISIONES TOMADAS:`);
      data.decisiones.forEach(d => { if (d) lines.push(`  • ${d}`); });
    }

    if (data.aprendizajes?.length) {
      lines.push(`\nAPRENDIZAJES DEL EQUIPO:`);
      data.aprendizajes.forEach(a => { if (a) lines.push(`  • ${a}`); });
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
