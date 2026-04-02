import { ApiProperty } from '@nestjs/swagger';

export class HallazgoDestacadoDto {
  @ApiProperty() visita: string;
  @ApiProperty() tipo: string;
  @ApiProperty() observacion: string;
  @ApiProperty() insight: string;
}

export class VisitaCampoReportDto {
  @ApiProperty() executiveSummary: string;
  @ApiProperty({ type: [HallazgoDestacadoDto] }) hallazgosDestacados: HallazgoDestacadoDto[];
  @ApiProperty({ type: [String] }) patronesContextuales: string[];
  @ApiProperty({ type: [String] }) elementosInvisibles: string[];
  @ApiProperty({ type: [String] }) workaroundsEncontrados: string[];
  @ApiProperty({ type: [String] }) painPointsCriticos: string[];
  @ApiProperty({ type: [String] }) insightsDeContexto: string[];
  @ApiProperty({ type: [String] }) oportunidades: string[];
  @ApiProperty({ type: [String] }) recommendations: string[];
}

export class VisitaCampoAnalyzeResDto {
  @ApiProperty() version: number;
  @ApiProperty() generatedAt: string;
  @ApiProperty({ type: VisitaCampoReportDto }) report: VisitaCampoReportDto;
}
