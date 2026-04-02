import { ApiProperty } from '@nestjs/swagger';

export class AnalisisIdeaSeleccionadaDto {
  @ApiProperty() idea: string;
  @ApiProperty() potencial: string;
  @ApiProperty() riesgos: string;
  @ApiProperty() nextSteps: string;
}

export class MapaConvergenciaReportDto {
  @ApiProperty() executiveSummary: string;
  @ApiProperty({ type: [AnalisisIdeaSeleccionadaDto] }) analisisIdeasSeleccionadas: AnalisisIdeaSeleccionadaDto[];
  @ApiProperty({ type: [String] }) patronesConvergencia: string[];
  @ApiProperty({ type: [String] }) ideasARevisitar: string[];
  @ApiProperty({ type: [String] }) alertasDeEquipo: string[];
  @ApiProperty({ type: [String] }) recommendations: string[];
}

export class MapaConvergenciaAnalyzeResDto {
  @ApiProperty() version: number;
  @ApiProperty() generatedAt: string;
  @ApiProperty({ type: MapaConvergenciaReportDto }) report: MapaConvergenciaReportDto;
}
