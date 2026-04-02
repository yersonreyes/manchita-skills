import { ApiProperty } from '@nestjs/swagger';

export class KeyFactsReportDto {
  @ApiProperty()
  executiveSummary: string;

  @ApiProperty({ type: [String] })
  patronesIdentificados: string[];

  @ApiProperty({ type: [String] })
  factsDestacados: string[];

  @ApiProperty({ type: [String] })
  tensionesYContradicciones: string[];

  @ApiProperty({ type: [String] })
  implicacionesEstrategicas: string[];

  @ApiProperty({ type: [String] })
  oportunidadesDeDiseno: string[];

  @ApiProperty({ type: [String] })
  recommendations: string[];
}

export class KeyFactsAnalyzeResDto {
  @ApiProperty({ example: 1 })
  version: number;

  @ApiProperty({ example: '2026-03-30T12:00:00.000Z' })
  generatedAt: string;

  @ApiProperty({ type: KeyFactsReportDto })
  report: KeyFactsReportDto;
}
