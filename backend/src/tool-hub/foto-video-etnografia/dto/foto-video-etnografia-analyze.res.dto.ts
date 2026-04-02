import { ApiProperty } from '@nestjs/swagger';

export class FotoVideoInsightDto {
  @ApiProperty() categoria: string;
  @ApiProperty() insight: string;
  @ApiProperty() evidencia: string;
}

export class FotoVideoEtnografiaReportDto {
  @ApiProperty() executiveSummary: string;
  @ApiProperty({ type: [String] }) patronesPrincipales: string[];
  @ApiProperty({ type: [FotoVideoInsightDto] }) insights: FotoVideoInsightDto[];
  @ApiProperty() contextoUsuario: string;
  @ApiProperty({ type: [String] }) workaroundsDetectados: string[];
  @ApiProperty({ type: [String] }) citasVisualesDestacadas: string[];
  @ApiProperty({ type: [String] }) oportunidades: string[];
  @ApiProperty({ type: [String] }) recommendations: string[];
}

export class FotoVideoEtnografiaAnalyzeResDto {
  @ApiProperty() version: number;
  @ApiProperty() generatedAt: string;
  @ApiProperty({ type: FotoVideoEtnografiaReportDto }) report: FotoVideoEtnografiaReportDto;
}
