import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { DesafioDisenoAnalyzeReqDto } from './dto/desafio-diseno-analyze.req.dto';
import { DesafioDisenoAnalyzeResDto, DesafioDisenoReportDto } from './dto/desafio-diseno-analyze.res.dto';
import { buildProjectContextSection, ProjectBriefContext } from '../shared/project-context';

@Injectable()
export class DesafioDisenoAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(dto: DesafioDisenoAnalyzeReqDto): Promise<DesafioDisenoAnalyzeResDto> {
    const { tool, project } = await this.loadContext(dto.toolApplicationId);
    const systemPrompt = this.buildSystemPrompt(tool, project);
    const dataText = this.formatData(dto);

    const raw = await this.aiService.chat(
      [{ role: 'user', content: `${dataText}\n\nGenerá el análisis en JSON ahora.` }],
      systemPrompt,
      2048,
    );

    let report: DesafioDisenoReportDto;
    try {
      report = JSON.parse(this.extractJson(raw)) as DesafioDisenoReportDto;
    } catch {
      console.error('[DesafioDisenoAnalyzeService] Raw AI response:', raw);
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

    return `Sos un experto en Design Thinking, formulación de Design Challenges y estrategia de diseño. Tu especialidad es evaluar la claridad y accionabilidad de los desafíos de diseño, identificar los constraints reales que el equipo debe respetar, y orientar la ideación hacia enfoques productivos sin anticipar las soluciones.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá los Design Challenges definidos y generá un análisis estratégico en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 3-4 oraciones: cuántos desafíos se definieron, qué problema central articulan, si están bien enmarcados, y qué tipo de soluciones habilita su formulación.",
  "analisisPorDesafio": [
    {
      "enunciado": "El desafío reformulado de manera precisa usando el template: ¿Cómo podemos [acción] para [usuario] dentro de [contexto] para [resultado]?",
      "fortaleza": "Qué hace bien este desafío — especificidad, claridad de usuario, realismo de constraints, orientación al outcome.",
      "riesgo": "Qué podría limitar o distorsionar la ideación — ambigüedad, scope demasiado amplio, solución implícita en el enunciado, constraint irreal.",
      "hmwDerivados": [
        "¿Cómo podríamos [ángulo específico del desafío — distinto al enunciado principal]?",
        "¿Cómo podríamos [ángulo alternativo que abre espacio creativo diferente]?",
        "¿Cómo podríamos [ángulo que cuestiona el constraint — qué pasa si no hay restricción]?"
      ]
    }
  ],
  "desafioMasCritico": "El desafío con mayor impacto potencial — cita el enunciado reformulado y en 1 oración explicá por qué es el más crítico para el proyecto.",
  "constraintsClaves": [
    "Constraint real que el equipo DEBE respetar — describilo con precisión y su implicación para el diseño",
    "Segundo constraint con qué tipo de soluciones descarta",
    "Tercer constraint si existe"
  ],
  "criteriosExitoSugeridos": [
    "Criterio medible y observable que indicaría que el desafío fue resuelto — con métrica sugerida si aplica",
    "Segundo criterio de éxito concreto",
    "Tercer criterio de éxito"
  ],
  "posiblesEnfoques": [
    "Dirección de solución que este desafío habilita — sin definir la solución, solo el enfoque estratégico",
    "Segundo enfoque con diferente angulación al problema",
    "Tercer enfoque que quizás el equipo no consideró"
  ],
  "recommendations": [
    "Acción concreta para el equipo antes de empezar la ideación — basada en el análisis del desafío",
    "Segunda recomendación para refinar o validar el desafío con stakeholders",
    "Tercera recomendación sobre cómo medir el éxito de las soluciones"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- El "analisisPorDesafio" debe tener una entrada por cada desafío documentado.
- Un buen Design Challenge NO incluye la solución — si la tiene, señalalo en el riesgo.
- Los HMW derivados deben explorar ángulos distintos al enunciado principal — no lo repitan.
- Los criteriosExitoSugeridos deben ser medibles u observables, no aspiracionales.
- Mínimo 2 constraintsClaves, 3 criteriosExitoSugeridos, 3 posiblesEnfoques, 3 recommendations.`;
  }

  private formatData(dto: DesafioDisenoAnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== DESAFÍO DE DISEÑO ==='];

    if (data.contexto) lines.push(`Contexto del proyecto: ${data.contexto}`);

    if (data.desafios?.length) {
      lines.push(`\nTotal de desafíos definidos: ${data.desafios.length}`);
      data.desafios.forEach((d, i) => {
        lines.push(`\n--- DESAFÍO ${i + 1} ---`);
        if (d.accion) lines.push(`Acción: ${d.accion}`);
        if (d.usuario) lines.push(`Usuario: ${d.usuario}`);
        if (d.contexto) lines.push(`Contexto/Restricciones: ${d.contexto}`);
        if (d.resultado) lines.push(`Resultado esperado: ${d.resultado}`);
        if (d.constraints?.length) lines.push(`Constraints adicionales: ${d.constraints.join(', ')}`);
        if (d.criteriosExito?.length) lines.push(`Criterios de éxito definidos: ${d.criteriosExito.join(', ')}`);

        if (d.accion && d.usuario) {
          let enunciado = `Enunciado: ¿Cómo podemos ${d.accion} para ${d.usuario}`;
          if (d.contexto) enunciado += ` dentro de ${d.contexto}`;
          if (d.resultado) enunciado += ` para ${d.resultado}`;
          enunciado += '?';
          lines.push(enunciado);
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
