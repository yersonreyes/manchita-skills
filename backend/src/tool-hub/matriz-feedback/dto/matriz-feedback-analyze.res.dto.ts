import { ApiProperty } from '@nestjs/swagger';

export class MatrizFeedbackReportDto {
  @ApiProperty() executiveSummary: string;
  @ApiProperty() patronesIdentificados: string;
  @ApiProperty({ type: [String] }) prioridadAcciones: string[];
  @ApiProperty({ type: [String] }) insightsDestacados: string[];
  @ApiProperty() feedbackAIgnorar: string;
  @ApiProperty({ type: [String] }) recommendations: string[];
}

export class MatrizFeedbackAnalyzeResDto {
  @ApiProperty({ example: 1 }) version: number;
  @ApiProperty({ example: '2026-04-04T12:00:00.000Z' }) generatedAt: string;
  @ApiProperty({ type: MatrizFeedbackReportDto })
  report: MatrizFeedbackReportDto;
}
