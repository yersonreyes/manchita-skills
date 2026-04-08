import { ApiProperty } from '@nestjs/swagger';

export class PrototipoFuncionalReportDto {
  @ApiProperty() executiveSummary: string;
  @ApiProperty() validacionTecnica: string;
  @ApiProperty({ type: [String] }) hallazgosCriticos: string[];
  @ApiProperty({ type: [String] }) hallazgosUX: string[];
  @ApiProperty() estadoFlujos: string;
  @ApiProperty() nivelConfianza: string;
  @ApiProperty({ type: [String] }) recommendations: string[];
}

export class PrototipoFuncionalAnalyzeResDto {
  @ApiProperty() version: number;
  @ApiProperty() generatedAt: string;
  @ApiProperty({ type: PrototipoFuncionalReportDto })
  report: PrototipoFuncionalReportDto;
}
