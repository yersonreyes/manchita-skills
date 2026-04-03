import { ApiProperty } from '@nestjs/swagger';

export class FriccionEmocionalDto {
  @ApiProperty() momento: string;
  @ApiProperty() emocion: string;
  @ApiProperty({ enum: ['alta', 'media', 'baja'] }) intensidad: 'alta' | 'media' | 'baja';
}

export class SupuestoContrastadoDto {
  @ApiProperty() supuesto: string;
  @ApiProperty({ enum: ['validado', 'refutado', 'parcial'] }) resultado: 'validado' | 'refutado' | 'parcial';
  @ApiProperty() evidencia: string;
}

export class PrototipoEmpatizarReportDto {
  @ApiProperty() executiveSummary: string;
  @ApiProperty() nivelEmpatiaAlcanzado: string;
  @ApiProperty({ type: [String] }) insightsClaves: string[];
  @ApiProperty({ type: [FriccionEmocionalDto] }) friccionesEmocionales: FriccionEmocionalDto[];
  @ApiProperty({ type: [SupuestoContrastadoDto] }) supuestosContrastados: SupuestoContrastadoDto[];
  @ApiProperty({ type: [String] }) implicacionesDiseno: string[];
  @ApiProperty({ type: [String] }) recommendations: string[];
}

export class PrototipoEmpatizarAnalyzeResDto {
  @ApiProperty() version: number;
  @ApiProperty() generatedAt: string;
  @ApiProperty({ type: PrototipoEmpatizarReportDto }) report: PrototipoEmpatizarReportDto;
}
