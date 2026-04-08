import { ApiProperty } from '@nestjs/swagger';

export class BmcBlockAnalysisDto {
  @ApiProperty({ example: ['Propuesta diferenciada', 'Mercado claro'] })
  strengths: string[];

  @ApiProperty({ example: ['Canales sin definir'] })
  weaknesses: string[];

  @ApiProperty({ example: ['Validar el canal digital antes de escalar'] })
  suggestions: string[];
}

export class BmcReportDto {
  @ApiProperty({ example: 'El modelo de negocio muestra coherencia entre...' })
  executiveSummary: string;

  @ApiProperty({
    type: 'object',
    additionalProperties: { $ref: '#/components/schemas/BmcBlockAnalysisDto' },
  })
  blockAnalysis: Record<string, BmcBlockAnalysisDto>;

  @ApiProperty({ example: 7 })
  coherenceScore: number;

  @ApiProperty({ example: ['Dependencia excesiva de un único canal'] })
  risks: string[];

  @ApiProperty({ example: ['Diversificar canales de adquisición'] })
  recommendations: string[];
}

export class BmcAnalyzeResDto {
  @ApiProperty({ example: 1 })
  version: number;

  @ApiProperty({ example: '2026-03-29T12:00:00.000Z' })
  generatedAt: string;

  @ApiProperty({ type: BmcReportDto })
  report: BmcReportDto;
}
