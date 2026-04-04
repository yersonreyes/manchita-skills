import { ApiProperty } from '@nestjs/swagger';

export class MatrizHipotesisReportDto {
  @ApiProperty()
  executiveSummary: string;

  @ApiProperty()
  prioridadValidacion: string;

  @ApiProperty({ type: [String] })
  hipotesisCriticas: string[];

  @ApiProperty({ type: [String] })
  experimentosRecomendados: string[];

  @ApiProperty({ type: [String] })
  riesgosIdentificados: string[];

  @ApiProperty({ type: [String] })
  recommendations: string[];
}

export class MatrizHipotesisAnalyzeResDto {
  @ApiProperty({ example: 1 })
  version: number;

  @ApiProperty({ example: '2026-04-03T12:00:00.000Z' })
  generatedAt: string;

  @ApiProperty({ type: MatrizHipotesisReportDto })
  report: MatrizHipotesisReportDto;
}
