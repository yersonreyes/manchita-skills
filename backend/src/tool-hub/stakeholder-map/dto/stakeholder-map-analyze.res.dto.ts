import { ApiProperty } from '@nestjs/swagger';

export class StakeholderQuadrantAnalysisDto {
  @ApiProperty({ type: [String] })
  actoresClave: string[];

  @ApiProperty()
  dinamica: string;

  @ApiProperty({ type: [String] })
  accionesRecomendadas: string[];
}

export class StakeholderMapQuadrantAnalysisDto {
  @ApiProperty({ type: StakeholderQuadrantAnalysisDto })
  'manage-closely': StakeholderQuadrantAnalysisDto;

  @ApiProperty({ type: StakeholderQuadrantAnalysisDto })
  'keep-satisfied': StakeholderQuadrantAnalysisDto;

  @ApiProperty({ type: StakeholderQuadrantAnalysisDto })
  'keep-informed': StakeholderQuadrantAnalysisDto;

  @ApiProperty({ type: StakeholderQuadrantAnalysisDto })
  monitor: StakeholderQuadrantAnalysisDto;
}

export class StakeholderMapReportDto {
  @ApiProperty()
  executiveSummary: string;

  @ApiProperty({ type: StakeholderMapQuadrantAnalysisDto })
  quadrantAnalysis: StakeholderMapQuadrantAnalysisDto;

  @ApiProperty({ type: [String] })
  alianzasEstrategicas: string[];

  @ApiProperty({ type: [String] })
  riesgosRelacionales: string[];

  @ApiProperty({ type: [String] })
  recommendations: string[];
}

export class StakeholderMapAnalyzeResDto {
  @ApiProperty({ example: 1 })
  version: number;

  @ApiProperty({ example: '2026-03-31T12:00:00.000Z' })
  generatedAt: string;

  @ApiProperty({ type: StakeholderMapReportDto })
  report: StakeholderMapReportDto;
}
