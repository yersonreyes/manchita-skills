import { ApiProperty } from '@nestjs/swagger';

export class BusquedaMediosReportDto {
  @ApiProperty() executiveSummary: string;
  @ApiProperty({ type: [String] }) tendenciasClave: string[];
  @ApiProperty() sentimentGeneral: string;
  @ApiProperty({ type: [String] }) narrativasPredominantes: string[];
  @ApiProperty({ type: [String] }) gapsIdentificados: string[];
  @ApiProperty({ type: [String] }) implicacionesDeDiseno: string[];
  @ApiProperty({ type: [String] }) recommendations: string[];
}

export class BusquedaMediosAnalyzeResDto {
  @ApiProperty() version: number;
  @ApiProperty() generatedAt: string;
  @ApiProperty({ type: BusquedaMediosReportDto }) report: BusquedaMediosReportDto;
}
