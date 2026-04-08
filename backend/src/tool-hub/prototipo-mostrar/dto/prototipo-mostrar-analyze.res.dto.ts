import { ApiProperty } from '@nestjs/swagger';

export class PrototipoMostrarReportDto {
  @ApiProperty() executiveSummary: string;
  @ApiProperty() efectividadNarrativa: string;
  @ApiProperty({ type: [String] }) fortalezasDelPitch: string[];
  @ApiProperty({ type: [String] }) gapsIdentificados: string[];
  @ApiProperty({ type: [String] }) feedbackPatterns: string[];
  @ApiProperty({ type: [String] }) pasosSiguientes: string[];
  @ApiProperty({ type: [String] }) recommendations: string[];
}

export class PrototipoMostrarAnalyzeResDto {
  @ApiProperty() version: number;
  @ApiProperty() generatedAt: string;
  @ApiProperty({ type: PrototipoMostrarReportDto })
  report: PrototipoMostrarReportDto;
}
