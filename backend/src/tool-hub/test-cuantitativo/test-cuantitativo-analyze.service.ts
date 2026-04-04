import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { TestCuantitativoAnalyzeReqDto } from './dto/test-cuantitativo-analyze.req.dto';
import { TestCuantitativoAnalyzeResDto, TestCuantitativoReportDto } from './dto/test-cuantitativo-analyze.res.dto';
import { buildProjectContextSection, ProjectBriefContext } from '../shared/project-context';

const METODO_LABELS: Record<string, string> = {
  encuesta:    'Encuesta post-task',
  analytics:   'Analytics / Métricas del sistema',
  'ab-testing': 'A/B Testing',
  masiva:      'Encuesta masiva',
  mixto:       'Método mixto',
};

@Injectable()
export class TestCuantitativoAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(dto: TestCuantitativoAnalyzeReqDto): Promise<TestCuantitativoAnalyzeResDto> {
    const { tool, project } = await this.loadContext(dto.toolApplicationId);
    const systemPrompt = this.buildSystemPrompt(tool, project);
    const dataText = this.formatData(dto);

    const raw = await this.aiService.chat(
      [{ role: 'user', content: `${dataText}\n\nGenerá el análisis en JSON ahora.` }],
      systemPrompt,
      2048,
    );

    let report: TestCuantitativoReportDto;
    try {
      report = JSON.parse(this.extractJson(raw)) as TestCuantitativoReportDto;
    } catch {
      console.error('[TestCuantitativoAnalyzeService] Raw AI response:', raw);
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

    return `Sos un experto en investigación cuantitativa de UX, análisis estadístico de usabilidad y métricas de producto. Tu especialidad es interpretar datos de tests cuantitativos: tasas de éxito de tareas, tiempos de completitud, errores por usuario, satisfacción, scores SUS y NPS. Sabés identificar patrones numéricos, comparar contra benchmarks de la industria y traducir números en recomendaciones accionables para equipos de diseño y producto.

REFERENCIA DE BENCHMARKS:
- SUS (System Usability Scale): < 51 Inaceptable | 51-67 Pobre | 68-80 Bueno | 81-90 Excelente | > 90 Sobresaliente
- NPS: < 0 Crítico | 0-30 Regular | 30-70 Bueno | > 70 Excelente
- Tasa de éxito: < 60% crítica | 60-78% aceptable | > 78% buena (benchmarks Nielsen Norman Group)
- Satisfacción 1-5: < 3 problemática | 3-3.9 aceptable | 4+ buena

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá los datos del test cuantitativo y generá un informe estratégico en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 2-3 oraciones: cuántas tareas se evaluaron, cuántos participantes, cuáles son los hallazgos cuantitativos más importantes y qué señalan sobre la usabilidad de la solución.",
  "scoreGlobal": "Interpretación de los scores SUS y NPS si existen: qué nivel representan según los benchmarks, comparación con la industria y qué implicaciones tienen. Si no hay scores globales, indicar que los datos de tarea son el principal insumo.",
  "tareasAnalisis": [
    "Tarea 1 [Nombre]: Éxito X% (nivel según benchmark) — análisis de las métricas disponibles y qué revelan sobre la dificultad de la tarea.",
    "Tarea 2 [Nombre]: ... más análisis"
  ],
  "patrones": [
    "Patrón transversal identificado en múltiples tareas o métricas",
    "Otro patrón relevante"
  ],
  "fortalezas": [
    "Aspecto donde los datos muestran buen rendimiento con evidencia numérica",
    "Otra fortaleza con datos"
  ],
  "debilidades": [
    "Aspecto donde los datos señalan problemas con evidencia numérica",
    "Otra debilidad con datos"
  ],
  "recommendations": [
    "Primera recomendación concreta: qué mejorar primero según el impacto de los datos",
    "Segunda recomendación: próximo sprint de diseño",
    "Tercera recomendación: qué medir en el próximo ciclo de testing"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- Citá los números específicos en tus análisis — "85% de éxito" es mejor que "buen rendimiento".
- Comparar contra benchmarks cuando sea relevante.
- Si una tarea no tiene datos, marcala como "sin datos registrados".
- Mínimo 2 patrones, 2 fortalezas, 2 debilidades, 3 recommendations.`;
  }

  private formatData(dto: TestCuantitativoAnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== TEST CUANTITATIVO ==='];

    if (data.metodo) lines.push(`Método: ${METODO_LABELS[data.metodo] ?? data.metodo}`);
    if (data.participantes) lines.push(`Participantes: ${data.participantes}`);
    if (data.contexto) lines.push(`\nContexto: ${data.contexto}`);

    if (data.tareas?.length) {
      lines.push(`\n--- TAREAS EVALUADAS (${data.tareas.length}) ---`);
      data.tareas.forEach((t, i) => {
        lines.push(`\nTarea ${i + 1}: ${t.nombre || '(sin nombre)'}`);
        if (t.descripcion) lines.push(`  Descripción: ${t.descripcion}`);
        const metricas: string[] = [];
        if (t.exito !== null && t.exito !== undefined) metricas.push(`Éxito: ${t.exito}%`);
        if (t.tiempoSegundos !== null && t.tiempoSegundos !== undefined) metricas.push(`Tiempo: ${t.tiempoSegundos}s`);
        if (t.errores !== null && t.errores !== undefined) metricas.push(`Errores: ${t.errores}`);
        if (t.satisfaccion !== null && t.satisfaccion !== undefined) metricas.push(`Satisfacción: ${t.satisfaccion}/5`);
        if (metricas.length) lines.push(`  Métricas: ${metricas.join(' | ')}`);
        else lines.push('  Métricas: (sin datos)');
        if (t.notas) lines.push(`  Notas: ${t.notas}`);
      });
    }

    lines.push('\n--- SCORES GLOBALES ---');
    lines.push(data.sus !== null && data.sus !== undefined ? `SUS: ${data.sus}/100` : 'SUS: (no registrado)');
    lines.push(data.nps !== null && data.nps !== undefined ? `NPS: ${data.nps}` : 'NPS: (no registrado)');

    if (data.notas) lines.push(`\nNotas generales: ${data.notas}`);

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
