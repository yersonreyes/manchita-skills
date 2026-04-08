import { ApiProperty } from '@nestjs/swagger';

export class FodaQuadrantAnalysisDto {
  @ApiProperty({ example: ['Equipo sólido y experimentado'] })
  observations: string[];

  @ApiProperty({
    example: ['Capitalizar la experiencia del equipo en nuevos mercados'],
  })
  suggestions: string[];
}

export class FodaQuadrantRiskDto {
  @ApiProperty({ example: ['La debilidad puede frenar el crecimiento'] })
  risks: string[];

  @ApiProperty({
    example: ['Buscar financiamiento externo o alianzas estratégicas'],
  })
  mitigations: string[];
}

export class FodaQuadrantAnalysisMapDto {
  @ApiProperty({ type: FodaQuadrantAnalysisDto })
  fortalezas: FodaQuadrantAnalysisDto;

  @ApiProperty({ type: FodaQuadrantAnalysisDto })
  oportunidades: FodaQuadrantAnalysisDto;

  @ApiProperty({ type: FodaQuadrantRiskDto })
  debilidades: FodaQuadrantRiskDto;

  @ApiProperty({ type: FodaQuadrantRiskDto })
  amenazas: FodaQuadrantRiskDto;
}

export class FodaReportDto {
  @ApiProperty({
    example:
      'El análisis FODA muestra una organización con fortalezas sólidas...',
  })
  executiveSummary: string;

  @ApiProperty({ type: FodaQuadrantAnalysisMapDto })
  quadrantAnalysis: FodaQuadrantAnalysisMapDto;

  @ApiProperty({
    example: 7,
    description: 'Puntuación estratégica general de 1 a 10',
  })
  strategicScore: number;

  @ApiProperty({
    example: ['Expansión a nuevos mercados aprovechando el equipo'],
  })
  keyOpportunities: string[];

  @ApiProperty({
    example: ['Competencia puede ganar participación si no se actúa rápido'],
  })
  criticalThreats: string[];

  @ApiProperty({ example: ['Definir un plan de financiamiento a 6 meses'] })
  recommendations: string[];
}

export class FodaAnalyzeResDto {
  @ApiProperty({ example: 1 })
  version: number;

  @ApiProperty({ example: '2026-03-29T12:00:00.000Z' })
  generatedAt: string;

  @ApiProperty({ type: FodaReportDto })
  report: FodaReportDto;
}
