import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AnalisisEscenarioDto {
  @ApiProperty() nombre: string;
  @ApiPropertyOptional() tipo: string;
  @ApiProperty({ type: [String] }) momentosMagicos: string[];
  @ApiProperty({ type: [String] }) puntosDeFriccion: string[];
  @ApiProperty() emocionDominante: string;
}

export class DisenioEscenariosReportDto {
  @ApiProperty() executiveSummary: string;
  @ApiProperty({ type: [AnalisisEscenarioDto] }) analisisEscenarios: AnalisisEscenarioDto[];
  @ApiProperty({ type: [String] }) patronesEmocionales: string[];
  @ApiProperty({ type: [String] }) friccionesComunes: string[];
  @ApiProperty({ type: [String] }) oportunidadesDiseno: string[];
  @ApiProperty({ type: [String] }) recommendations: string[];
}

export class DisenioEscenariosAnalyzeResDto {
  @ApiProperty() version: number;
  @ApiProperty() generatedAt: string;
  @ApiProperty({ type: DisenioEscenariosReportDto }) report: DisenioEscenariosReportDto;
}
