import { ApiProperty } from '@nestjs/swagger';

export class PoemsInsightDimensionDto {
  @ApiProperty()
  dimension: string;

  @ApiProperty()
  insight: string;
}

export class PoemsReportDto {
  @ApiProperty()
  executiveSummary: string;

  @ApiProperty({ type: [PoemsInsightDimensionDto] })
  insightsPorDimension: PoemsInsightDimensionDto[];

  @ApiProperty({ type: [String] })
  patronesCross: string[];

  @ApiProperty()
  dimensionMasRica: string;

  @ApiProperty({ type: [String] })
  tensionesYContradicciones: string[];

  @ApiProperty({ type: [String] })
  oportunidades: string[];

  @ApiProperty({ type: [String] })
  recommendations: string[];
}

export class PoemsAnalyzeResDto {
  @ApiProperty()
  version: number;

  @ApiProperty()
  generatedAt: string;

  @ApiProperty({ type: PoemsReportDto })
  report: PoemsReportDto;
}
