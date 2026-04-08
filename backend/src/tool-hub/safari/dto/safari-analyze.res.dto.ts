import { ApiProperty } from '@nestjs/swagger';

export class ObservacionDestacadaDto {
  @ApiProperty() sesion: string;
  @ApiProperty() momento: string;
  @ApiProperty() observacion: string;
  @ApiProperty() insight: string;
}

export class SafariReportDto {
  @ApiProperty() executiveSummary: string;
  @ApiProperty({ type: [ObservacionDestacadaDto] })
  observacionesDestacadas: ObservacionDestacadaDto[];
  @ApiProperty({ type: [String] }) patronesComportamiento: string[];
  @ApiProperty({ type: [String] }) workaroundsEncontrados: string[];
  @ApiProperty({ type: [String] }) painPointsCriticos: string[];
  @ApiProperty({ type: [String] }) momentosWow: string[];
  @ApiProperty({ type: [String] }) oportunidades: string[];
  @ApiProperty({ type: [String] }) recommendations: string[];
}

export class SafariAnalyzeResDto {
  @ApiProperty() version: number;
  @ApiProperty() generatedAt: string;
  @ApiProperty({ type: SafariReportDto }) report: SafariReportDto;
}
