import { ApiProperty } from '@nestjs/swagger';

export class PrototipoFisicoReportDto {
  @ApiProperty() executiveSummary: string;
  @ApiProperty() evaluacionProgresion: string;
  @ApiProperty({ type: [String] }) hallazgosErgonomicos: string[];
  @ApiProperty({ type: [String] }) problemasDetectados: string[];
  @ApiProperty({ type: [String] }) mejorasValidadas: string[];
  @ApiProperty({ type: [String] }) riesgosParaProduccion: string[];
  @ApiProperty({ type: [String] }) recommendations: string[];
}

export class PrototipoFisicoAnalyzeResDto {
  @ApiProperty() version: number;
  @ApiProperty() generatedAt: string;
  @ApiProperty({ type: PrototipoFisicoReportDto })
  report: PrototipoFisicoReportDto;
}
