import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { HibridacionSintesisAnalyzeReqDto } from './dto/hibridacion-sintesis-analyze.req.dto';
import {
  HibridacionSintesisAnalyzeResDto,
  HibridacionSintesisReportDto,
} from './dto/hibridacion-sintesis-analyze.res.dto';
import {
  buildProjectContextSection,
  ProjectBriefContext,
} from '../shared/project-context';

const NIVEL_LABELS: Record<string, string> = {
  superficial: 'Superficial (combina features visibles)',
  estructural: 'Estructural (cambia la arquitectura del producto/servicio)',
  paradigmatico: 'Paradigmático (crea un nuevo modelo mental o categoría)',
};

@Injectable()
export class HibridacionSintesisAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(
    dto: HibridacionSintesisAnalyzeReqDto,
  ): Promise<HibridacionSintesisAnalyzeResDto> {
    const { tool, project } = await this.loadContext(dto.toolApplicationId);
    const systemPrompt = this.buildSystemPrompt(tool, project);
    const dataText = this.formatData(dto);

    const raw = await this.aiService.chat(
      [
        {
          role: 'user',
          content: `${dataText}\n\nGenerá el análisis en JSON ahora.`,
        },
      ],
      systemPrompt,
      2048,
    );

    let report: HibridacionSintesisReportDto;
    try {
      report = JSON.parse(
        this.extractJson(raw),
      ) as HibridacionSintesisReportDto;
    } catch {
      console.error(
        '[HibridacionSintesisAnalyzeService] Raw AI response:',
        raw,
      );
      throw new UnprocessableEntityException(
        'La respuesta del AI no es JSON válido',
      );
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

    return `Sos un experto en innovación disruptiva, Design Thinking y estrategia de producto. Tu especialidad es analizar procesos de hibridación por síntesis: el nivel MÁS PROFUNDO de hibridación, donde no se suman features ni se trasladan mecanismos — se funden esencias para crear algo cualitativamente NUEVO que no existiría sin la combinación.

Tu misión: evaluar si la síntesis realmente crea algo nuevo o es solo agregación disfrazada, identificar la tensión creativa entre los conceptos, articular la nueva esencia que emerge, y determinar si el nivel de síntesis declarado corresponde a lo que realmente están creando.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá el proceso de hibridación por síntesis documentado y generá un análisis estratégico en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "Síntesis de 2-3 oraciones: qué conceptos se están fusionando, qué emerge de la síntesis, y si realmente crea algo nuevo o es una combinación superficial.",
  "evaluacionNivel": "Evaluación crítica del nivel de síntesis declarado: ¿corresponde a lo que realmente están creando? ¿Es realmente paradigmático o en realidad es estructural/superficial? ¿La síntesis crea una nueva categoría o refuerza una existente? Sé directo — si el nivel está mal declarado, decílo con argumentos.",
  "analisisConceptos": [
    {
      "nombre": "Nombre del concepto base",
      "esencia": "La esencia REAL del concepto — no lo que hace, sino el principio subyacente que lo hace funcionar (ej: 'progresión visible de status en comunidad de pares')",
      "contribucionReal": "Qué elemento de su esencia aporta realmente a la síntesis — no todo el concepto, sino el principio específico que se fusiona",
      "tensionCreativa": "La tensión entre este concepto y los otros — las diferencias que generan fricción creativa y de las cuales puede emerger algo nuevo"
    }
  ],
  "puntosConexionClave": [
    "Punto de conexión más importante entre los conceptos — el que más potencial de síntesis tiene",
    "Segundo punto de conexión — puede ser un problema compartido, un mecanismo análogo, o una necesidad humana común",
    "Más puntos si los hay — priorizados por potencial creativo"
  ],
  "nuevaEsencia": "Lo más importante del análisis: ¿qué nueva esencia emerge de la síntesis? ¿Qué principio o modelo mental no existía antes y que ahora existe? Esta es la prueba de si hay síntesis real o solo agregación. Si no hay nueva esencia clara, señalalo.",
  "diferenciacionParadigmatica": "Cómo esta síntesis redefine las reglas del juego: ¿crea una nueva categoría o subcategoría? ¿hace obsoletos supuestos existentes? ¿cómo cambia la forma en que usuarios/clientes van a pensar sobre este tipo de solución?",
  "riesgos": [
    "Riesgo principal: ¿la síntesis es demasiado compleja para que los usuarios la adopten? ¿requiere un cambio de comportamiento demasiado grande?",
    "Segundo riesgo: ¿el mercado está listo para este nivel de innovación? ¿hay precedentes de adopción?",
    "Tercer riesgo si aplica — puede ser operativo, cultural, o de recursos"
  ],
  "recommendations": [
    "Cómo validar que la nueva esencia resuena con los usuarios (test de concepto, prototipo mínimo)",
    "Si bajar el nivel de síntesis para una versión inicial (MVP de la síntesis) y llegar al nivel paradigmático gradualmente",
    "Cómo proteger la síntesis (propiedad intelectual, moats, ventajas de first-mover)"
  ]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto antes ni después.
- Respondés en español.
- En analisisConceptos: analizá CADA concepto documentado.
- El núcleo de este análisis es la NUEVA ESENCIA: ¿qué existe después de la síntesis que no existía antes? Si la síntesis no genera nueva esencia, lo decís con claridad.
- Sé crítico con el nivel de síntesis declarado. La mayoría de las "síntesis paradigmáticas" son en realidad estructurales o superficiales. Pero si realmente es paradigmática, reconocelo.
- Mínimo 2 puntosConexionClave, 2 riesgos, 3 recommendations.`;
  }

  private formatData(dto: HibridacionSintesisAnalyzeReqDto): string {
    const { data } = dto;
    const lines: string[] = ['=== HIBRIDACIÓN POR SÍNTESIS ==='];

    if (data.contexto) lines.push(`\nCONTEXTO / DESAFÍO:\n"${data.contexto}"`);

    if (data.nivelSintesis) {
      const nivelLabel = NIVEL_LABELS[data.nivelSintesis] ?? data.nivelSintesis;
      lines.push(`\nNIVEL DE SÍNTESIS DECLARADO: ${nivelLabel}`);
    }

    if (data.conceptosBase?.length) {
      lines.push(
        `\nCONCEPTOS BASE A SINTETIZAR (${data.conceptosBase.length}):`,
      );
      data.conceptosBase.forEach((c, i) => {
        lines.push(`\n  ${i + 1}. ${c.nombre || '[Sin nombre]'}`);
        if (c.descripcion) lines.push(`     Descripción: ${c.descripcion}`);
        if (c.esencia)
          lines.push(`     Esencia (qué lo hace funcionar): ${c.esencia}`);
        if (c.contribucion)
          lines.push(`     Qué aporta a la síntesis: ${c.contribucion}`);
      });
    }

    if (data.puntosConexion?.length) {
      lines.push(`\nPUNTOS DE CONEXIÓN IDENTIFICADOS:`);
      data.puntosConexion.forEach((p, i) => {
        lines.push(`  ${i + 1}. ${p}`);
      });
    }

    if (data.ideaSintetizada)
      lines.push(`\nIDEA SINTETIZADA:\n"${data.ideaSintetizada}"`);
    if (data.nuevoParadigma)
      lines.push(`\nNUEVO PARADIGMA PROPUESTO: "${data.nuevoParadigma}"`);

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
