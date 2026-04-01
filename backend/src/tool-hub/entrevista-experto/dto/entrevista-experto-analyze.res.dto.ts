import { ApiProperty } from '@nestjs/swagger';

export class EntrevistaExpertoInsightDto {
  @ApiProperty() categoria: string;
  @ApiProperty() insight: string;
  @ApiProperty() evidencia: string;
}

export class EntrevistaExpertoReportDto {
  @ApiProperty() executiveSummary: string;
  @ApiProperty() perfilExperto: string;
  @ApiProperty({ type: [EntrevistaExpertoInsightDto] }) insights: EntrevistaExpertoInsightDto[];
  @ApiProperty({ type: [String] }) tendenciasClave: string[];
  @ApiProperty({ type: [String] }) barrerasYDesafios: string[];
  @ApiProperty({ type: [String] }) oportunidadesIdentificadas: string[];
  @ApiProperty({ type: [String] }) citasExperto: string[];
  @ApiProperty({ type: [String] }) recommendations: string[];
}

export class EntrevistaExpertoAnalyzeResDto {
  @ApiProperty() version: number;
  @ApiProperty() generatedAt: string;
  @ApiProperty({ type: EntrevistaExpertoReportDto }) report: EntrevistaExpertoReportDto;
}
