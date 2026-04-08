import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AnalisisTraslacionDto {
  @ApiProperty() dominioOrigen: string;
  @ApiProperty() mecanismo: string;
  @ApiProperty() potencialDeTraslacion: string;
  @ApiProperty({ type: [String] }) desafiosAdaptacion: string[];
  @ApiPropertyOptional() impactoEsperado: string;
}

export class HibridacionTraslacionReportDto {
  @ApiProperty() executiveSummary: string;
  @ApiProperty() evaluacionTraslacion: string;
  @ApiProperty({ type: [AnalisisTraslacionDto] })
  analisisTraslaciones: AnalisisTraslacionDto[];
  @ApiProperty() mecanismoClavePotenciado: string;
  @ApiProperty({ type: [String] }) riesgosContextuales: string[];
  @ApiProperty() diferenciacionCompetitiva: string;
  @ApiProperty({ type: [String] }) recommendations: string[];
}

export class HibridacionTraslacionAnalyzeResDto {
  @ApiProperty() version: number;
  @ApiProperty() generatedAt: string;
  @ApiProperty({ type: HibridacionTraslacionReportDto })
  report: HibridacionTraslacionReportDto;
}
