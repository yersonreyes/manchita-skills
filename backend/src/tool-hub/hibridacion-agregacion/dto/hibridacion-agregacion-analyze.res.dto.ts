import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AnalisisCombinacionDto {
  @ApiProperty() combinacion: string;
  @ApiProperty() sinergia: string;
  @ApiPropertyOptional() riesgo: string;
}

export class HibridacionAgregacionReportDto {
  @ApiProperty() executiveSummary: string;
  @ApiProperty() evaluacionHibrida: string;
  @ApiProperty({ type: [String] }) elementosClave: string[];
  @ApiProperty({ type: [AnalisisCombinacionDto] })
  sinergiasDetectadas: AnalisisCombinacionDto[];
  @ApiProperty({ type: [String] }) riesgosIntegracion: string[];
  @ApiProperty() propuestaValorAmpliada: string;
  @ApiProperty({ type: [String] }) recommendations: string[];
}

export class HibridacionAgregacionAnalyzeResDto {
  @ApiProperty() version: number;
  @ApiProperty() generatedAt: string;
  @ApiProperty({ type: HibridacionAgregacionReportDto })
  report: HibridacionAgregacionReportDto;
}
