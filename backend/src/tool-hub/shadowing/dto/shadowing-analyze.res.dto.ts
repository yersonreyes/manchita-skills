import { ApiProperty } from '@nestjs/swagger';

export class ObservacionDestacadaShadowingDto {
  @ApiProperty() participante: string;
  @ApiProperty() hora: string;
  @ApiProperty() observacion: string;
  @ApiProperty() insight: string;
}

export class ShadowingReportDto {
  @ApiProperty() executiveSummary: string;
  @ApiProperty({ type: [ObservacionDestacadaShadowingDto] })
  observacionesDestacadas: ObservacionDestacadaShadowingDto[];
  @ApiProperty({ type: [String] }) flujosDeTrabajo: string[];
  @ApiProperty({ type: [String] }) workaroundsEncontrados: string[];
  @ApiProperty({ type: [String] }) painPointsCriticos: string[];
  @ApiProperty({ type: [String] }) decisiones: string[];
  @ApiProperty({ type: [String] }) oportunidades: string[];
  @ApiProperty({ type: [String] }) recommendations: string[];
}

export class ShadowingAnalyzeResDto {
  @ApiProperty() version: number;
  @ApiProperty() generatedAt: string;
  @ApiProperty({ type: ShadowingReportDto }) report: ShadowingReportDto;
}
