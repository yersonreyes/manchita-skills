import { ApiProperty } from '@nestjs/swagger';

export class AnalisisDesafioDto {
  @ApiProperty() enunciado: string;
  @ApiProperty() fortaleza: string;
  @ApiProperty() riesgo: string;
  @ApiProperty({ type: [String] }) hmwDerivados: string[];
}

export class DesafioDisenoReportDto {
  @ApiProperty() executiveSummary: string;
  @ApiProperty({ type: [AnalisisDesafioDto] })
  analisisPorDesafio: AnalisisDesafioDto[];
  @ApiProperty() desafioMasCritico: string;
  @ApiProperty({ type: [String] }) constraintsClaves: string[];
  @ApiProperty({ type: [String] }) criteriosExitoSugeridos: string[];
  @ApiProperty({ type: [String] }) posiblesEnfoques: string[];
  @ApiProperty({ type: [String] }) recommendations: string[];
}

export class DesafioDisenoAnalyzeResDto {
  @ApiProperty() version: number;
  @ApiProperty() generatedAt: string;
  @ApiProperty({ type: DesafioDisenoReportDto }) report: DesafioDisenoReportDto;
}
