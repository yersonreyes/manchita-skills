import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { BriefAnalyzeReqDto } from './dto/brief-analyze.req.dto';
import { BriefAnalyzeResDto, BriefReportDto } from './dto/brief-analyze.res.dto';
import { buildProjectContextSection, ProjectBriefContext } from '../shared/project-context';

@Injectable()
export class BriefAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(dto: BriefAnalyzeReqDto): Promise<BriefAnalyzeResDto> {
    const { tool, project } = await this.loadContext(dto.toolApplicationId);
    const systemPrompt = this.buildSystemPrompt(tool, project);
    const dataText = this.formatData(dto);

    const raw = await this.aiService.chat(
      [{ role: 'user', content: `${dataText}\n\nGenerá el análisis en JSON ahora.` }],
      systemPrompt,
      2048,
    );

    let report: BriefReportDto;
    try {
      report = JSON.parse(this.extractJson(raw)) as BriefReportDto;
    } catch {
      console.error('[BriefAnalyzeService] Raw AI response:', raw);
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

    return `Sos un experto en gestión de proyectos de diseño, Design Thinking y estrategia de producto. Tu especialidad es revisar documentos de brief de diseño, identificar gaps críticos que podrían descarrilar el proyecto, y dar recomendaciones concretas para fortalecer el scope y los objetivos antes de que empiece el trabajo.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá el Brief de Proyecto documentado y generá una auditoría estratégica en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 3-4 oraciones: qué tan completo y claro está el brief, cuáles son sus fortalezas principales, cuáles son los gaps más críticos que podrían afectar el proyecto, y cuál es el riesgo general (bajo / medio / alto) de arrancar con este brief.",
  "fortalezas": [
    "Elemento bien definido del brief — qué está claro, específico o bien delimitado, y por qué eso es valioso",
    "Segunda fortaleza concreta del brief",
    "Tercera fortaleza si existe"
  ],
  "gapsCriticos": [
    "Sección incompleta o ausente que podría generar problemas durante el proyecto — explicá el riesgo concreto que genera este gap",
    "Segundo gap con qué tipo de problema podría causar (scope creep, misalignment, falta de criterios, etc.)",
    "Tercer gap si existe"
  ],
  "alertas": [
    "Señal de alerta en el brief que no es un gap de información sino un riesgo de proyecto — Ej: objetivo no SMART, usuario target muy amplio, timeline irreal, métrica no medible",
    "Segunda alerta con qué impacto podría tener si no se resuelve",
    "Tercera alerta si existe"
  ],
  "sugerenciasScope": [
    "Elemento que debería estar explícitamente in-scope o out-of-scope pero no está definido — explica por qué genera ambigüedad",
    "Segunda sugerencia de scope con qué stakeholders podría generar conflicto",
    "Tercera sugerencia si aplica"
  ],
  "recommendations": [
    "Acción concreta a tomar antes de arrancar el proyecto — con quién, qué decision, qué clarificación",
    "Segunda recomendación accionable con impacto directo en la calidad del proyecto",
    "Tercera recomendación para fortalecer el brief antes del kickoff"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- Si el brief está muy incompleto, indicalo en executiveSummary con el nivel de riesgo.
- Los gapsCriticos son secciones faltantes — las alertas son problemas en lo que SÍ está documentado.
- Las recomendaciones deben ser específicas y accionables, no genéricas.
- Mínimo 2 fortalezas, 2 gapsCriticos, 2 alertas, 2 sugerenciasScope, 3 recommendations.
- Si algo no está en el brief, no lo inventes — señalalo como gap.`;
  }

  private formatData(dto: BriefAnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== BRIEF DE PROYECTO ==='];

    if (data.contexto) lines.push(`\n1. CONTEXTO:\n${data.contexto}`);
    else lines.push('\n1. CONTEXTO: [No definido]');

    if (data.objetivoPrincipal) lines.push(`\n2. OBJETIVO PRINCIPAL:\n${data.objetivoPrincipal}`);
    else lines.push('\n2. OBJETIVO PRINCIPAL: [No definido]');

    if (data.objetivosSecundarios?.length) {
      lines.push('Objetivos secundarios:');
      data.objetivosSecundarios.forEach(o => lines.push(`  • ${o}`));
    }

    if (data.usuarioTarget) lines.push(`\n3. USUARIO TARGET:\n${data.usuarioTarget}`);
    else lines.push('\n3. USUARIO TARGET: [No definido]');

    lines.push('\n4. SCOPE:');
    if (data.inScope?.length) {
      lines.push('In scope:');
      data.inScope.forEach(i => lines.push(`  ✓ ${i}`));
    } else lines.push('In scope: [No definido]');
    if (data.outScope?.length) {
      lines.push('Out of scope:');
      data.outScope.forEach(o => lines.push(`  ✗ ${o}`));
    } else lines.push('Out of scope: [No definido]');

    lines.push('\n5. RESTRICCIONES:');
    if (data.timeline) lines.push(`Timeline: ${data.timeline}`);
    if (data.budget) lines.push(`Budget: ${data.budget}`);
    if (data.restriccionesTech) lines.push(`Técnicas: ${data.restriccionesTech}`);
    if (data.otrasRestricciones) lines.push(`Otras: ${data.otrasRestricciones}`);
    if (!data.timeline && !data.budget && !data.restriccionesTech) lines.push('[No definidas]');

    lines.push('\n6. STAKEHOLDERS:');
    if (data.decisionMaker) lines.push(`Decision maker: ${data.decisionMaker}`);
    if (data.contacto) lines.push(`Contacto: ${data.contacto}`);
    if (data.equipo) lines.push(`Equipo: ${data.equipo}`);
    if (!data.decisionMaker && !data.contacto) lines.push('[No definidos]');

    if (data.entregables?.length) {
      lines.push('\n7. ENTREGABLES:');
      data.entregables.forEach(e => lines.push(`  • ${e}`));
    } else lines.push('\n7. ENTREGABLES: [No definidos]');

    if (data.metricasExito?.length) {
      lines.push('\n8. MÉTRICAS DE ÉXITO:');
      data.metricasExito.forEach(m => lines.push(`  • ${m}`));
    } else lines.push('\n8. MÉTRICAS DE ÉXITO: [No definidas]');

    if (data.riesgos?.length) {
      lines.push('\n9. RIESGOS:');
      data.riesgos.forEach(r => lines.push(`  • ${r}`));
    } else lines.push('\n9. RIESGOS: [No definidos]');

    if (data.timelineMilestones) lines.push(`\n10. TIMELINE / MILESTONES:\n${data.timelineMilestones}`);
    else lines.push('\n10. TIMELINE / MILESTONES: [No definido]');

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
