import { ApiProperty } from '@nestjs/swagger';

export class FocusGroupInsightDto {
  @ApiProperty() categoria: string;
  @ApiProperty() insight: string;
  @ApiProperty() evidencia: string;
}

export class FocusGroupReportDto {
  @ApiProperty() executiveSummary: string;
  @ApiProperty({ type: [String] }) patronesPrincipales: string[];
  @ApiProperty({ type: [FocusGroupInsightDto] }) insights: FocusGroupInsightDto[];
  @ApiProperty({ type: [String] }) consensos: string[];
  @ApiProperty({ type: [String] }) disensos: string[];
  @ApiProperty({ type: [String] }) citasDestacadas: string[];
  @ApiProperty() dinamicasObservadas: string;
  @ApiProperty({ type: [String] }) oportunidades: string[];
  @ApiProperty({ type: [String] }) recommendations: string[];
}

export class FocusGroupAnalyzeResDto {
  @ApiProperty() version: number;
  @ApiProperty() generatedAt: string;
  @ApiProperty({ type: FocusGroupReportDto }) report: FocusGroupReportDto;
}
