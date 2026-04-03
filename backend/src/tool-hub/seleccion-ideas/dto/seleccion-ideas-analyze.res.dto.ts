import { ApiProperty } from '@nestjs/swagger';

export class AnalisisIdeaDto {
  @ApiProperty() idea: string;
  @ApiProperty() scoreTotal: number;
  @ApiProperty({ type: [String] }) puntosFuertes: string[];
  @ApiProperty({ type: [String] }) puntosDebiles: string[];
  @ApiProperty() recomendacion: string;
}

export class SeleccionIdeasReportDto {
  @ApiProperty() executiveSummary: string;
  @ApiProperty({ type: [AnalisisIdeaDto] }) analisisIdeasSeleccionadas: AnalisisIdeaDto[];
  @ApiProperty({ type: [String] }) patronesDecision: string[];
  @ApiProperty({ type: [String] }) ideasRescatables: string[];
  @ApiProperty({ type: [String] }) alertasDeEquipo: string[];
  @ApiProperty({ type: [String] }) recommendations: string[];
}

export class SeleccionIdeasAnalyzeResDto {
  @ApiProperty() version: number;
  @ApiProperty() generatedAt: string;
  @ApiProperty({ type: SeleccionIdeasReportDto }) report: SeleccionIdeasReportDto;
}
