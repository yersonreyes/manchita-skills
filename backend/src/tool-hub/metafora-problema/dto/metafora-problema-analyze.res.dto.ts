import { ApiProperty } from '@nestjs/swagger';

export class AnalisisMetaforaDto {
  @ApiProperty() titulo: string;
  @ApiProperty() fertilidad: string;
  @ApiProperty({ type: [String] }) insightsDerivados: string[];
  @ApiProperty() limitaciones: string;
  @ApiProperty({ type: [String] }) aplicacionesPotenciales: string[];
}

export class MetaforaProblemaReportDto {
  @ApiProperty() executiveSummary: string;
  @ApiProperty({ type: [AnalisisMetaforaDto] }) analisisPorMetafora: AnalisisMetaforaDto[];
  @ApiProperty() metaforaRecomendada: string;
  @ApiProperty({ type: [String] }) insightsClave: string[];
  @ApiProperty({ type: [String] }) implicacionesDeDiseno: string[];
  @ApiProperty({ type: [String] }) recommendations: string[];
}

export class MetaforaProblemaAnalyzeResDto {
  @ApiProperty() version: number;
  @ApiProperty() generatedAt: string;
  @ApiProperty({ type: MetaforaProblemaReportDto }) report: MetaforaProblemaReportDto;
}
