import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { HibridacionTraslacionAnalyzeReqDto } from './dto/hibridacion-traslacion-analyze.req.dto';
import { HibridacionTraslacionAnalyzeResDto, HibridacionTraslacionReportDto } from './dto/hibridacion-traslacion-analyze.res.dto';
import { buildProjectContextSection, ProjectBriefContext } from '../shared/project-context';

const FUENTE_LABELS: Record<string, string> = {
  'industria-similar': 'Industria similar',
  'industria-diferente': 'Industria diferente',
  'naturaleza': 'Naturaleza / Biomímesis',
  'vida-cotidiana': 'Vida cotidiana',
  'tecnologia': 'Tecnología de otro campo',
};

@Injectable()
export class HibridacionTraslacionAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(dto: HibridacionTraslacionAnalyzeReqDto): Promise<HibridacionTraslacionAnalyzeResDto> {
    const { tool, project } = await this.loadContext(dto.toolApplicationId);
    const systemPrompt = this.buildSystemPrompt(tool, project);
    const dataText = this.formatData(dto);

    const raw = await this.aiService.chat(
      [{ role: 'user', content: `${dataText}\n\nGenerá el análisis en JSON ahora.` }],
      systemPrompt,
      2048,
    );

    let report: HibridacionTraslacionReportDto;
    try {
      report = JSON.parse(this.extractJson(raw)) as HibridacionTraslacionReportDto;
    } catch {
      console.error('[HibridacionTraslacionAnalyzeService] Raw AI response:', raw);
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

    return `Sos un experto en innovación por analogía, Design Thinking y estrategia de producto. Tu especialidad es analizar procesos de hibridación por traslación: evaluar qué tan relevante y aplicable es el mecanismo trasladado desde otro dominio, detectar el verdadero potencial innovador de la traducción, identificar los riesgos de adaptación contextual y articular cómo la traslación genera diferenciación competitiva real.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá el proceso de hibridación por traslación documentado y generá un análisis estratégico en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 2-3 oraciones: qué problema se busca resolver, de qué dominio(s) se trasladaron mecanismos, y cuál es la idea resultante y su principal fortaleza innovadora.",
  "evaluacionTraslacion": "Evaluación cualitativa de la traslación: ¿el mecanismo trasladado ataca el problema correcto? ¿la analogía es superficial o captura el mecanismo subyacente real? ¿la traducción al nuevo contexto es coherente? ¿cuánto riesgo de que el mecanismo no funcione igual en el nuevo contexto?",
  "analisisTraslaciones": [
    {
      "dominioOrigen": "Nombre del dominio de origen (ej: 'Juegos MMORPG')",
      "mecanismo": "El mecanismo subyacente identificado — no la solución superficial sino el principio que funciona (ej: 'progresión con status social visible')",
      "potencialDeTraslacion": "Por qué este mecanismo tiene potencial en el nuevo contexto — qué aspecto del problema ataca y por qué funcionaría",
      "desafiosAdaptacion": [
        "Primer desafío concreto de adaptar este mecanismo al nuevo contexto",
        "Segundo desafío — puede ser técnico, cultural, regulatorio o de expectativas del usuario"
      ],
      "impactoEsperado": "Qué cambio concreto generaría en el usuario o el negocio si la traslación funciona"
    }
  ],
  "mecanismoClavePotenciado": "Análisis profundo del mecanismo central que se está trasladando: ¿por qué funciona en el dominio origen? ¿qué necesidades humanas toca? ¿por qué esas mismas necesidades existen en el contexto destino? Este es el corazón de la traslación.",
  "riesgosContextuales": [
    "Riesgo principal de que el mecanismo no funcione igual en el nuevo contexto — diferencias culturales, regulatorias, de modelo de negocio",
    "Segundo riesgo — puede ser que los usuarios del nuevo contexto tengan expectativas muy distintas",
    "Tercer riesgo si aplica"
  ],
  "diferenciacionCompetitiva": "Cómo esta traslación genera diferenciación: ¿por qué los competidores actuales no hacen esto? ¿qué barrera crea? ¿es sostenible o fácilmente copiable? ¿qué ventaja da al equipo que lo implemente primero?",
  "recommendations": [
    "Primer paso para validar que la traslación funciona en el nuevo contexto (ej: test de concepto con usuarios, prototipo del mecanismo clave)",
    "Cómo adaptar el mecanismo para reducir el principal riesgo identificado",
    "Si explorar más traslaciones de dominios relacionados para enriquecer la idea"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- En analisisTraslaciones: analizá CADA traslación documentada. Si solo hay una, hacé un análisis profundo de esa.
- El foco de este análisis es el MECANISMO SUBYACENTE, no la solución superficial. Ayudá al equipo a entender si están trasladando el principio correcto.
- Mínimo 1 analisisTraslaciones, 2 riesgosContextuales, 3 recommendations.
- Si el problema no está bien definido, señalalo en evaluacionTraslacion y ayudá a refinarlo.`;
  }

  private formatData(dto: HibridacionTraslacionAnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== HIBRIDACIÓN POR TRASLACIÓN ==='];

    if (data.problema) lines.push(`\nPROBLEMA A RESOLVER:\n"${data.problema}"`);
    else lines.push('\nPROBLEMA: [No definido]');

    if (data.contexto) lines.push(`\nCONTEXTO / INDUSTRIA: ${data.contexto}`);

    if (data.traslaciones?.length) {
      lines.push(`\nTRASLACIONES DOCUMENTADAS (${data.traslaciones.length}):`);
      data.traslaciones.forEach((t, i) => {
        const fuenteLabel = t.fuenteTipo ? ` [${FUENTE_LABELS[t.fuenteTipo] ?? t.fuenteTipo}]` : '';
        lines.push(`\n  ${i + 1}. Dominio origen: ${t.dominioOrigen || '[Sin nombre]'}${fuenteLabel}`);
        if (t.mecanismo) lines.push(`     Mecanismo subyacente: ${t.mecanismo}`);
        if (t.como) lines.push(`     Cómo lo resuelven allá: ${t.como}`);
        if (t.traduccion) lines.push(`     Traducción al contexto actual: ${t.traduccion}`);
      });
    }

    if (data.mecanismoClave) lines.push(`\nMECANISMO CLAVE IDENTIFICADO: "${data.mecanismoClave}"`);
    if (data.ideaResultante) lines.push(`\nIDEA RESULTANTE:\n"${data.ideaResultante}"`);

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
