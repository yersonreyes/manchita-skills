import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { MvpAnalyzeReqDto } from './dto/mvp-analyze.req.dto';
import { MvpAnalyzeResDto, MvpReportDto } from './dto/mvp-analyze.res.dto';
import { buildProjectContextSection, ProjectBriefContext } from '../shared/project-context';

const TIPO_LABELS: Record<string, string> = {
  'wizard-of-oz': 'Wizard of Oz (humanos simulan el sistema)',
  'concierge': 'Concierge (servicio manual antes de automatizar)',
  'landing-email': 'Landing + Email (validar interés con landing page)',
  'crowdfunding': 'Crowdfunding (video prototipo para validar demanda)',
  'feature-mvp': 'Feature MVP (solo el core feature que resuelve el problema)',
};

@Injectable()
export class MvpAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(dto: MvpAnalyzeReqDto): Promise<MvpAnalyzeResDto> {
    const { tool, project } = await this.loadContext(dto.toolApplicationId);
    const systemPrompt = this.buildSystemPrompt(tool, project);
    const dataText = this.formatData(dto);

    const raw = await this.aiService.chat(
      [{ role: 'user', content: `${dataText}\n\nGenerá el análisis en JSON ahora.` }],
      systemPrompt,
      2048,
    );

    let report: MvpReportDto;
    try {
      report = JSON.parse(this.extractJson(raw)) as MvpReportDto;
    } catch {
      console.error('[MvpAnalyzeService] Raw AI response:', raw);
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

    return `Sos un experto en Lean Startup, product development y validación de hipótesis de negocio. Tu especialidad es analizar MVPs: evaluar si la hipótesis está bien formulada, si el scope del MVP es realmente mínimo (sin feature creep), si las métricas son accionables, y si los aprendizajes post-lanzamiento llevan a decisiones concretas de build/measure/learn.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá el MVP documentado y generá un análisis estratégico en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 2-3 oraciones: qué tipo de MVP está construyendo el equipo, qué hipótesis quieren validar, y en qué estado está la validación.",
  "validezHipotesis": "Evaluación de la hipótesis principal: ¿está formulada de manera que se puede validar o falsear? ¿tiene un usuario específico, un problema claro y una solución identificable? ¿es lo suficientemente arriesgada como para necesitar validación antes de buildear? Si la hipótesis está bien formulada, decilo; si tiene problemas, explicá cuáles.",
  "evaluacionScope": "Análisis del scope del MVP: ¿el core feature elegido es realmente el mínimo para validar la hipótesis? ¿hay features incluidas que no son necesarias para la validación? ¿hay features excluidas que en realidad son críticas? Evaluá el resultado de la matriz de priorización si está disponible.",
  "calidadMetricas": "Evaluación de las métricas definidas: ¿son métricas accionables (leading indicators) o vanity metrics (lagging indicators)? ¿tienen un umbral de éxito/fracaso claro? ¿permiten distinguir si la hipótesis se validó o no? Si no hay métricas definidas, indicalo como riesgo crítico.",
  "estadoValidacion": "Si hay aprendizajes post-lanzamiento: evaluá si las hipótesis se validaron, qué evidencia lo demuestra, y cuál debería ser el próximo paso (perseverar, pivotar o descontinuar). Si no hay aprendizajes aún, evaluá la probabilidad de validación basándose en el diseño del MVP.",
  "recommendations": [
    "Recomendación inmediata y concreta — si deben ajustar la hipótesis, cambiar el scope, mejorar las métricas, o ya pueden lanzar",
    "Qué riesgo tiene mayor probabilidad de invalidar el MVP aunque la hipótesis sea correcta (riesgo técnico, de mercado, de go-to-market)",
    "Cómo estructurar el ciclo build-measure-learn para que el próximo MVP sea más eficiente"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- Si no hay aprendizajes post-lanzamiento, estadoValidacion debe evaluar el diseño del MVP en vez de resultados.
- Si la hipótesis es vaga o no se puede falsear, señalalo — es el problema más común y más dañino.
- No validés el tipo de MVP sin contexto — un Wizard of Oz puede ser perfecto o completamente inadecuado según lo que se esté validando.
- Mínimo 3 recommendations específicas y accionables.`;
  }

  private formatData(dto: MvpAnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== MVP (MÍNIMO PRODUCTO VIABLE) ==='];

    if (data.hipotesisPrincipal) lines.push(`\nHIPÓTESIS PRINCIPAL:\n"${data.hipotesisPrincipal}"`);
    if (data.tipo) lines.push(`\nTIPO DE MVP: ${TIPO_LABELS[data.tipo] ?? data.tipo}`);
    if (data.coreFeature) lines.push(`\nCORE FEATURE (la única cosa que debe funcionar):\n"${data.coreFeature}"`);

    if (data.features?.length) {
      const incluidas = data.features.filter(f => f.incluida);
      const excluidas = data.features.filter(f => !f.incluida);
      lines.push(`\nMATRIZ DE FEATURES (${data.features.length} total):`);
      if (incluidas.length) {
        lines.push('\n  INCLUIDAS EN EL MVP:');
        incluidas.forEach(f => {
          const cat = this.getCategoria(f.valorUsuario, f.esfuerzo);
          lines.push(`  • [${cat}] ${f.nombre || '(sin nombre)'} — Valor usuario: ${f.valorUsuario ?? '?'}, Esfuerzo: ${f.esfuerzo ?? '?'}`);
        });
      }
      if (excluidas.length) {
        lines.push('\n  EXCLUIDAS:');
        excluidas.forEach(f => {
          const cat = this.getCategoria(f.valorUsuario, f.esfuerzo);
          lines.push(`  • [${cat}] ${f.nombre || '(sin nombre)'} — Valor usuario: ${f.valorUsuario ?? '?'}, Esfuerzo: ${f.esfuerzo ?? '?'}`);
        });
      }
    }

    if (data.criteriosLanzamiento?.length) {
      lines.push(`\nCRITERIOS DE LANZAMIENTO:`);
      data.criteriosLanzamiento.forEach(c => { if (c) lines.push(`  ✓ ${c}`); });
    }

    if (data.metricas?.length) {
      lines.push(`\nMÉTRICAS A MEDIR:`);
      data.metricas.forEach(m => { if (m) lines.push(`  • ${m}`); });
    }

    if (data.aprendizajes?.length) {
      lines.push(`\nAPRENDIZAJES POST-LANZAMIENTO (${data.aprendizajes.length}):`);
      data.aprendizajes.forEach((ap, i) => {
        const estado = ap.validada === true ? 'VALIDADA' : ap.validada === false ? 'INVALIDADA' : 'PENDIENTE';
        lines.push(`\n  ${i + 1}. Hipótesis [${estado}]: "${ap.hipotesis || '(sin hipótesis)'}"`);
        if (ap.metrica) lines.push(`     Métrica observada: "${ap.metrica}"`);
        if (ap.resultado) lines.push(`     Resultado: "${ap.resultado}"`);
      });
    }

    return lines.join('\n');
  }

  private getCategoria(valorUsuario?: string, esfuerzo?: string): string {
    if (valorUsuario === 'alto' && esfuerzo === 'bajo') return 'MVP';
    if (valorUsuario === 'alto' && esfuerzo === 'alto') return 'Later';
    if (valorUsuario === 'bajo' && esfuerzo === 'bajo') return 'Mandatory';
    if (valorUsuario === 'bajo' && esfuerzo === 'alto') return 'Drop';
    return '?';
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
