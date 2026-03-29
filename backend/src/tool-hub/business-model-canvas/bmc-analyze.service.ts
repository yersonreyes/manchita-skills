import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { BmcAnalyzeReqDto, BmcBlocksDto } from './dto/bmc.req.dto';
import { BmcAnalyzeResDto, BmcReportDto } from './dto/bmc.res.dto';
import { buildProjectContextSection, ProjectBriefContext } from '../shared/project-context';

@Injectable()
export class BmcAnalyzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(dto: BmcAnalyzeReqDto, currentVersion: number): Promise<BmcAnalyzeResDto> {
    const { tool, project } = await this.loadContext(dto.toolApplicationId);
    const systemPrompt = this.buildSystemPrompt(tool, project);
    const blocksText = this.formatBlocks(dto.blocks);

    const raw = await this.aiService.chat(
      [{ role: 'user', content: `Aquí está el Business Model Canvas completo para analizar:\n\n${blocksText}\n\nGenerá el informe en JSON ahora.` }],
      systemPrompt,
      2048,
    );

    let report: BmcReportDto;
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

    return `Sos un consultor estratégico experto en modelos de negocio. Te han presentado un Business Model Canvas completo.

CONTEXTO DE LA HERRAMIENTA:
- Descripción: ${tool.descripcion}
${tool.comoSeUsa ? `- Cómo se usa: ${tool.comoSeUsa}` : ''}${projectSection}

TU TAREA:
Analizá el Business Model Canvas que se te proporciona y generá un informe estructurado en JSON con EXACTAMENTE este formato:

{
  "executiveSummary": "párrafo de 3-4 oraciones que sintetiza las fortalezas y debilidades del modelo de negocio",
  "blockAnalysis": {
    "propuestaDeValor": { "strengths": ["..."], "weaknesses": ["..."], "suggestions": ["..."] },
    "segmentosDeClientes": { "strengths": ["..."], "weaknesses": ["..."], "suggestions": ["..."] },
    "canales": { "strengths": ["..."], "weaknesses": ["..."], "suggestions": ["..."] },
    "relacionesConClientes": { "strengths": ["..."], "weaknesses": ["..."], "suggestions": ["..."] },
    "fuentesDeIngreso": { "strengths": ["..."], "weaknesses": ["..."], "suggestions": ["..."] },
    "recursosClaves": { "strengths": ["..."], "weaknesses": ["..."], "suggestions": ["..."] },
    "actividadesClaves": { "strengths": ["..."], "weaknesses": ["..."], "suggestions": ["..."] },
    "asociacionesClaves": { "strengths": ["..."], "weaknesses": ["..."], "suggestions": ["..."] },
    "estructuraDeCostos": { "strengths": ["..."], "weaknesses": ["..."], "suggestions": ["..."] }
  },
  "coherenceScore": 7,
  "risks": ["riesgo crítico 1", "riesgo crítico 2"],
  "recommendations": ["recomendación accionable 1", "recomendación accionable 2", "recomendación accionable 3"]
}

REGLAS:
- Respondés ÚNICAMENTE con el JSON, sin texto adicional antes ni después.
- coherenceScore es un entero de 1 a 10 que refleja qué tan alineados están los 9 bloques entre sí.
- Si un bloque está vacío o incompleto, indícalo en weaknesses con "Bloque sin completar".
- Cada array de strengths/weaknesses/suggestions tiene entre 1 y 3 items.
- risks son riesgos estratégicos del modelo completo (no de bloques individuales).
- recommendations son acciones concretas y prioritarias para mejorar el modelo.
- Respondés en español.`;
  }

  private formatBlocks(blocks: BmcBlocksDto): string {
    return `
=== PROPUESTA DE VALOR ===
¿Qué problema resolvés?: ${blocks.propuestaDeValor.problemasQueResuelve || '(sin completar)'}
¿Qué ganancia generás?: ${blocks.propuestaDeValor.beneficiosClave || '(sin completar)'}
¿Qué ofrecés concretamente?: ${blocks.propuestaDeValor.productoServicio || '(sin completar)'}

=== SEGMENTOS DE CLIENTES ===
¿Quién es tu cliente principal?: ${blocks.segmentosDeClientes.clientePrincipal || '(sin completar)'}
¿Qué los define?: ${blocks.segmentosDeClientes.caracteristicas || '(sin completar)'}
¿Qué necesidad tienen?: ${blocks.segmentosDeClientes.necesidadQueResuelves || '(sin completar)'}

=== CANALES ===
¿Cómo llegás a tus clientes?: ${blocks.canales.comoLlegasAlCliente || '(sin completar)'}
¿En qué etapa del funnel opera?: ${blocks.canales.etapaDelFunnel || '(sin completar)'}
¿Es eficiente en costos?: ${blocks.canales.costoEficiencia || '(sin completar)'}

=== RELACIONES CON CLIENTES ===
¿Qué tipo de relación tenés?: ${blocks.relacionesConClientes.tipoDeRelacion || '(sin completar)'}
¿Cómo adquirís clientes?: ${blocks.relacionesConClientes.adquisicion || '(sin completar)'}
¿Cómo los retenés?: ${blocks.relacionesConClientes.retencion || '(sin completar)'}

=== FUENTES DE INGRESO ===
¿Cómo generás ingresos?: ${blocks.fuentesDeIngreso.comoGenerasIngresos || '(sin completar)'}
¿Cuál es tu modelo de precio?: ${blocks.fuentesDeIngreso.modeloDePrecio || '(sin completar)'}
¿Cuánto pagaría tu cliente?: ${blocks.fuentesDeIngreso.disposicionAPagar || '(sin completar)'}

=== RECURSOS CLAVES ===
¿Qué recursos necesitás?: ${blocks.recursosClaves.recursosNecesarios || '(sin completar)'}
¿Son físicos, humanos, intelectuales?: ${blocks.recursosClaves.tipoDeRecurso || '(sin completar)'}
¿Cuál es el más crítico?: ${blocks.recursosClaves.masCritico || '(sin completar)'}

=== ACTIVIDADES CLAVES ===
¿Qué actividades son esenciales?: ${blocks.actividadesClaves.actividadesPrincipales || '(sin completar)'}
¿Producción, servicio o plataforma?: ${blocks.actividadesClaves.produccionVsServicio || '(sin completar)'}
¿Cuál te diferencia?: ${blocks.actividadesClaves.diferenciadoras || '(sin completar)'}

=== ASOCIACIONES CLAVES ===
¿Quiénes son tus socios clave?: ${blocks.asociacionesClaves.sociosPrincipales || '(sin completar)'}
¿Qué tercerizás?: ${blocks.asociacionesClaves.queTercerizan || '(sin completar)'}
¿Qué los motiva a asociarse?: ${blocks.asociacionesClaves.motivacion || '(sin completar)'}

=== ESTRUCTURA DE COSTOS ===
¿Cuáles son tus costos más grandes?: ${blocks.estructuraDeCostos.costosPrincipales || '(sin completar)'}
¿Fijos o variables?: ${blocks.estructuraDeCostos.costosFijosVsVariables || '(sin completar)'}
¿Hay economía de escala?: ${blocks.estructuraDeCostos.economiaDeEscala || '(sin completar)'}
`.trim();
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
