import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { MapaConvergenciaAnalyzeReqDto } from './dto/mapa-convergencia-analyze.req.dto';
import { MapaConvergenciaAnalyzeResDto, MapaConvergenciaReportDto } from './dto/mapa-convergencia-analyze.res.dto';
import { buildProjectContextSection, ProjectBriefContext } from '../shared/project-context';

@Injectable()
export class MapaConvergenciaAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(dto: MapaConvergenciaAnalyzeReqDto): Promise<MapaConvergenciaAnalyzeResDto> {
    const { tool, project } = await this.loadContext(dto.toolApplicationId);
    const systemPrompt = this.buildSystemPrompt(tool, project);
    const dataText = this.formatData(dto);

    const raw = await this.aiService.chat(
      [{ role: 'user', content: `${dataText}\n\nGenerá el análisis en JSON ahora.` }],
      systemPrompt,
      2048,
    );

    let report: MapaConvergenciaReportDto;
    try {
      report = JSON.parse(this.extractJson(raw)) as MapaConvergenciaReportDto;
    } catch {
      console.error('[MapaConvergenciaAnalyzeService] Raw AI response:', raw);
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

    return `Sos un experto en facilitación de procesos creativos, Design Thinking y toma de decisiones en equipos de innovación. Tu especialidad es el proceso de convergencia: analizar cómo un equipo filtró y priorizó ideas, evaluar la calidad de las selecciones, detectar patrones en la toma de decisiones, e identificar ideas descartadas que merecen reconsideración.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá el Mapa de Convergencia documentado — las ideas totales, las seleccionadas y las descartadas — y generá un análisis estratégico en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 2-3 oraciones: cuántas ideas se evaluaron, qué tan sólida fue la selección final, qué patrón de convergencia emergió (¿priorizaron viabilidad? ¿impacto? ¿diferenciación?), y cuál es la recomendación general para el equipo.",
  "analisisIdeasSeleccionadas": [
    {
      "idea": "Texto exacto de la idea seleccionada",
      "potencial": "Por qué esta idea tiene valor — qué problema específico resuelve y qué impacto podría tener",
      "riesgos": "Principales riesgos o limitaciones de esta idea que el equipo debería tener en cuenta",
      "nextSteps": "Qué debería hacer el equipo como siguiente paso concreto con esta idea"
    }
  ],
  "patronesConvergencia": [
    "Patrón observado en cómo el equipo tomó decisiones — Ej: priorizaron ideas de bajo costo, evitaron ideas que requerían integración con terceros",
    "Segundo patrón — qué tipo de ideas fueron consistentemente elegidas o rechazadas",
    "Tercer patrón si existe"
  ],
  "ideasARevisitar": [
    "Idea descartada que merece reconsideración — con justificación de por qué podría ser valiosa en otro contexto o versión del producto",
    "Segunda idea descartada prematuramente si aplica"
  ],
  "alertasDeEquipo": [
    "Señal de alerta en el proceso de convergencia — Ej: solo 1 de 10 ideas fue seleccionada (poco contexto), o todas las seleccionadas son del mismo cluster (falta de diversidad)",
    "Segunda alerta si existe"
  ],
  "recommendations": [
    "Qué hacer con las ideas seleccionadas como próximo paso inmediato (ej: prototipar, validar con usuarios, estimar esfuerzo)",
    "Cómo comunicar la decisión de convergencia al resto del equipo o stakeholders",
    "Qué explorar en la siguiente iteración de ideación si las ideas seleccionadas no resultan viables"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- Analizá SOLO las ideas con estado "seleccionada" en analisisIdeasSeleccionadas — no las activas ni descartadas.
- En ideasARevisitar: analizá las descartadas y destacá las que parecen prometedoras a pesar del descarte.
- Si solo hay 1 idea seleccionada, notalo en el summary como una convergencia muy fuerte que puede ser riesgosa.
- Mínimo 2 patronesConvergencia, 1 ideasARevisitar, 1 alertasDeEquipo, 3 recommendations.
- Si no hay ideas descartadas, omitir ideasARevisitar o indicar que no hubo descartes documentados.`;
  }

  private formatData(dto: MapaConvergenciaAnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== MAPA DE CONVERGENCIA ==='];

    if (data.contexto) lines.push(`\nCONTEXTO:\n${data.contexto}`);

    if (data.criterios?.length) {
      lines.push('\nCRITERIOS DE CONVERGENCIA USADOS:');
      data.criterios.forEach(c => lines.push(`  • ${c}`));
    }

    const seleccionadas = data.ideas.filter(i => i.estado === 'seleccionada');
    const activas = data.ideas.filter(i => i.estado === 'activa');
    const descartadas = data.ideas.filter(i => i.estado === 'descartada');

    lines.push(`\nRESUMEN: ${data.ideas.length} ideas totales — ${seleccionadas.length} seleccionadas, ${descartadas.length} descartadas, ${activas.length} en evaluación`);

    if (seleccionadas.length) {
      lines.push('\nIDEAS SELECCIONADAS:');
      seleccionadas.forEach(i => {
        lines.push(`  ✓ ${i.texto || '[Sin texto]'}${i.cluster ? ` [${i.cluster}]` : ''}`);
      });
    }

    if (descartadas.length) {
      lines.push('\nIDEAS DESCARTADAS:');
      descartadas.forEach(i => {
        const razon = i.razonDescarte ? ` — Razón: ${i.razonDescarte}` : '';
        lines.push(`  ✗ ${i.texto || '[Sin texto]'}${i.cluster ? ` [${i.cluster}]` : ''}${razon}`);
      });
    }

    if (activas.length) {
      lines.push('\nIDEAS EN EVALUACIÓN (no clasificadas):');
      activas.forEach(i => {
        lines.push(`  ○ ${i.texto || '[Sin texto]'}${i.cluster ? ` [${i.cluster}]` : ''}`);
      });
    }

    if (data.notas) lines.push(`\nNOTAS DEL EQUIPO:\n${data.notas}`);

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
