import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { BrainstormingAnalyzeReqDto } from './dto/brainstorming-analyze.req.dto';
import { BrainstormingAnalyzeResDto, BrainstormingReportDto } from './dto/brainstorming-analyze.res.dto';
import { buildProjectContextSection, ProjectBriefContext } from '../shared/project-context';

@Injectable()
export class BrainstormingAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(dto: BrainstormingAnalyzeReqDto): Promise<BrainstormingAnalyzeResDto> {
    const { tool, project } = await this.loadContext(dto.toolApplicationId);
    const systemPrompt = this.buildSystemPrompt(tool, project);
    const dataText = this.formatData(dto);

    const raw = await this.aiService.chat(
      [{ role: 'user', content: `${dataText}\n\nGenerá el análisis en JSON ahora.` }],
      systemPrompt,
      2048,
    );

    let report: BrainstormingReportDto;
    try {
      report = JSON.parse(this.extractJson(raw)) as BrainstormingReportDto;
    } catch {
      console.error('[BrainstormingAnalyzeService] Raw AI response:', raw);
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

    return `Sos un experto en facilitación de sesiones creativas, Design Thinking e innovación. Tu especialidad es analizar sesiones de brainstorming: evaluar la calidad de las ideas generadas, identificar patrones en la creatividad del equipo, detectar ideas con alto potencial innovador, y dar recomendaciones accionables para prototipar o continuar explorando.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá la sesión de brainstorming documentada y generá un análisis estratégico en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 2-3 oraciones: cuántas ideas se generaron, qué tan diversa fue la sesión, cuáles son las top ideas en función de los votos y el potencial, y qué recomienda el análisis como próximo paso.",
  "calidadSesion": "Evaluación de la calidad de la sesión: ¿las ideas son diversas o similares entre sí? ¿hay ideas disruptivas mezcladas con incrementales? ¿el reto estaba bien enmarcado? ¿cuánta innovación se logró?",
  "analisisTopIdeas": [
    {
      "idea": "Texto de una de las top ideas seleccionadas (o con más votos)",
      "potencial": "Por qué esta idea tiene potencial — qué problema específico resuelve, qué impacto podría tener en el usuario o el negocio",
      "riesgos": "Principales obstáculos o riesgos de implementar esta idea",
      "siguientesPasos": "Qué debería hacer el equipo como siguiente acción concreta con esta idea (ej: prototipo en papel, entrevista de validación, estimación técnica)"
    }
  ],
  "clustersDestacados": [
    "Cluster o categoría que concentró las ideas más votadas o más originales — y por qué ese tema emergió",
    "Segundo cluster destacado con análisis de por qué resonó con el equipo",
    "Tercer cluster si aplica"
  ],
  "ideasInnovadoras": [
    "Idea específica que rompe el patrón o es más disruptiva que el resto — aunque no haya tenido muchos votos",
    "Segunda idea innovadora que el equipo podría explorar en una segunda ronda de ideación"
  ],
  "ideasAExplorar": [
    "Idea que no fue seleccionada en el top pero que merece más exploración — con justificación de su potencial",
    "Segunda idea subestimada que podría dar resultados en otro contexto"
  ],
  "recommendations": [
    "Qué hacer con las top ideas como próximo paso inmediato (ej: prototipar, crear storyboard, validar con usuarios)",
    "Cómo refinar el reto si las ideas estuvieron muy concentradas en una sola dirección",
    "Si hacer una segunda ronda de brainstorming y en qué enfocarse para complementar lo generado"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- En analisisTopIdeas: incluí las ideas marcadas como "top ideas" por el equipo; si no hay top ideas, usá las más votadas.
- En ideasInnovadoras: buscá las ideas que son más originales o disruptivas, no necesariamente las más votadas.
- Mínimo 2 analisisTopIdeas (o todas las que haya), 2 clustersDestacados, 2 ideasInnovadoras, 2 ideasAExplorar, 3 recommendations.
- Si el reto no está definido, indicalo en calidadSesion y basate en las ideas para inferirlo.`;
  }

  private formatData(dto: BrainstormingAnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== SESIÓN DE BRAINSTORMING ==='];

    if (data.reto) lines.push(`\nRETO:\n"${data.reto}"`);
    else lines.push('\nRETO: [No definido]');

    if (data.tecnica) lines.push(`\nTÉCNICA UTILIZADA: ${data.tecnica}`);
    if (data.participantes) lines.push(`PARTICIPANTES: ${data.participantes}`);

    lines.push(`\nTOTAL DE IDEAS GENERADAS: ${data.ideas?.length ?? 0}`);

    if (data.ideas?.length) {
      // Ordenar por votos desc para mostrar primero las más votadas
      const sorted = [...data.ideas].sort((a, b) => (b.votos ?? 0) - (a.votos ?? 0));

      // Agrupar por cluster
      const clusters = new Map<string, typeof sorted>();
      sorted.forEach(idea => {
        const key = idea.cluster || 'Sin cluster';
        if (!clusters.has(key)) clusters.set(key, []);
        clusters.get(key)!.push(idea);
      });

      lines.push('\nIDEAS (ordenadas por votos):');
      clusters.forEach((ideas, cluster) => {
        lines.push(`\n  [${cluster}]`);
        ideas.forEach(idea => {
          const votos = idea.votos ? ` — ${idea.votos} voto${idea.votos === 1 ? '' : 's'}` : '';
          lines.push(`    • ${idea.texto || '[Sin texto]'}${votos}`);
        });
      });
    }

    if (data.topIdeas?.length) {
      lines.push('\nTOP IDEAS SELECCIONADAS POR EL EQUIPO:');
      data.topIdeas.forEach(t => lines.push(`  ★ ${t}`));
    }

    if (data.notas) lines.push(`\nNOTAS DEL FACILITADOR:\n${data.notas}`);

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
