import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { DiagramaSistemaAnalyzeReqDto, SistemaActorDto, SistemaConexionDto } from './dto/diagrama-sistema-analyze.req.dto';
import { DiagramaSistemaAnalyzeResDto, SistemaReportDto } from './dto/diagrama-sistema-analyze.res.dto';
import { buildProjectContextSection, ProjectBriefContext } from '../shared/project-context';

@Injectable()
export class DiagramaSistemaAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(dto: DiagramaSistemaAnalyzeReqDto, currentVersion: number): Promise<DiagramaSistemaAnalyzeResDto> {
    const { tool, project } = await this.loadContext(dto.toolApplicationId);
    const systemPrompt = this.buildSystemPrompt(tool, project);
    const dataText = this.formatData(dto);

    const raw = await this.aiService.chat(
      [{ role: 'user', content: `${dataText}\n\nGenerá el informe en JSON ahora.` }],
      systemPrompt,
      2048,
    );

    let report: SistemaReportDto;
    try {
      report = JSON.parse(this.extractJson(raw));
    } catch {
      throw new UnprocessableEntityException('La respuesta del AI no es JSON válido');
    }

    return {
      version: currentVersion + 1,
      generatedAt: new Date().toISOString(),
      report,
    };
  }

  private buildSystemPrompt(
    tool: { nombre: string; descripcion: string; comoSeUsa: string | null },
    project: ProjectBriefContext,
  ): string {
    const projectSection = buildProjectContextSection(project);

    return `Sos un experto en teoría de sistemas y Design Thinking, especializado en System Mapping y Diagrama de Sistema.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá el diagrama de sistema proporcionado e identificá:
1. Actores clave y su rol central en el ecosistema
2. Flujos críticos que mantienen o disrumpen el sistema
3. Bucles de retroalimentación (refuerzo o equilibrio)
4. Puntos de palanca: dónde un pequeño cambio tiene gran impacto

Generá el informe en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "síntesis de 3-4 oraciones sobre el ecosistema analizado, su estructura general y los hallazgos más relevantes",
  "actoresClave": [
    "actor X es clave porque ocupa una posición central/de intermediación/de control en el sistema"
  ],
  "flujosImportantes": [
    "el flujo de Y entre A y B es crítico porque sin él el sistema no puede funcionar/crecer/sostenerse"
  ],
  "buclesIdentificados": [
    "existe un bucle de refuerzo/equilibrio entre X e Y: cuando X aumenta, Y responde de tal modo que..."
  ],
  "puntasDePalanca": [
    "intervenir en X impactaría Y y Z porque es un nodo de alta conectividad/control/flujo en el sistema"
  ],
  "recommendations": [
    "acción concreta priorizada por impacto potencial en el ecosistema"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- Si hay pocos datos, indicalo en executiveSummary y generá al menos 2 items por sección.
- Las recomendaciones deben ser ordenadas por impacto potencial.
- "buclesIdentificados" puede ser vacío [] si no se detectan bucles claros.`;
  }

  private formatData(dto: DiagramaSistemaAnalyzeReqDto): string {
    const formatActores = (actores: SistemaActorDto[]) =>
      actores.length > 0
        ? actores.map((a, i) =>
            `${i + 1}. [${a.tipo.toUpperCase()}] ${a.nombre || '(sin nombre)'} — frontera: ${a.frontera}`,
          ).join('\n')
        : '(ninguno registrado)';

    const formatConexiones = (conexiones: SistemaConexionDto[], actores: SistemaActorDto[]) => {
      if (conexiones.length === 0) return '(ninguna registrada)';
      return conexiones.map((c, i) => {
        const from = actores.find(a => a.id === c.fromId);
        const to = actores.find(a => a.id === c.toId);
        return `${i + 1}. [${c.tipo.toUpperCase()}] ${from?.nombre ?? c.fromId} → ${to?.nombre ?? c.toId}: ${c.descripcion || '(sin descripción)'}`;
      }).join('\n');
    };

    return `=== ALCANCE DEL SISTEMA ===
${dto.data.alcance || '(sin definir)'}

=== ACTORES (${dto.data.actores.length}) ===
${formatActores(dto.data.actores)}

=== CONEXIONES (${dto.data.conexiones.length}) ===
${formatConexiones(dto.data.conexiones, dto.data.actores)}`.trim();
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
