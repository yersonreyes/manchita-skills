import { ApiProperty } from '@nestjs/swagger';

export class AnalisisPovDto {
  @ApiProperty() enunciado: string;
  @ApiProperty() fortaleza: string;
  @ApiProperty() oportunidadMejora: string;
  @ApiProperty({ type: [String] }) hmwSugeridos: string[];
}

export class PovReportDto {
  @ApiProperty() executiveSummary: string;
  @ApiProperty({ type: [AnalisisPovDto] }) analisisPorPov: AnalisisPovDto[];
  @ApiProperty() povMasAccionable: string;
  @ApiProperty({ type: [String] }) hmwPrioritarios: string[];
  @ApiProperty({ type: [String] }) tensionesIdentificadas: string[];
  @ApiProperty({ type: [String] }) recommendations: string[];
}

export class PovAnalyzeResDto {
  @ApiProperty() version: number;
  @ApiProperty() generatedAt: string;
  @ApiProperty({ type: PovReportDto }) report: PovReportDto;
}
