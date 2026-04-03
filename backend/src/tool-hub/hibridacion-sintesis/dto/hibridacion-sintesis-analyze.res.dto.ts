import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AnalisisConceptoDto {
  @ApiProperty() nombre: string;
  @ApiProperty() esencia: string;
  @ApiProperty() contribucionReal: string;
  @ApiProperty() tensionCreativa: string;
}

export class HibridacionSintesisReportDto {
  @ApiProperty() executiveSummary: string;
  @ApiProperty() evaluacionNivel: string;
  @ApiProperty({ type: [AnalisisConceptoDto] }) analisisConceptos: AnalisisConceptoDto[];
  @ApiProperty({ type: [String] }) puntosConexionClave: string[];
  @ApiProperty() nuevaEsencia: string;
  @ApiProperty() diferenciacionParadigmatica: string;
  @ApiProperty({ type: [String] }) riesgos: string[];
  @ApiProperty({ type: [String] }) recommendations: string[];
}

export class HibridacionSintesisAnalyzeResDto {
  @ApiProperty() version: number;
  @ApiProperty() generatedAt: string;
  @ApiProperty({ type: HibridacionSintesisReportDto }) report: HibridacionSintesisReportDto;
}
