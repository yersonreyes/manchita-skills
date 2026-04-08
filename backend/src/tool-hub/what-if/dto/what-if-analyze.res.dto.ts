import { ApiProperty } from '@nestjs/swagger';

export class AnalisisPreguntaDto {
  @ApiProperty() pregunta: string;
  @ApiProperty() tipo: string;
  @ApiProperty() potencialInnovador: string;
  @ApiProperty({ type: [String] }) implicaciones: string[];
  @ApiProperty() comoPrototipar: string;
}

export class WhatIfReportDto {
  @ApiProperty() executiveSummary: string;
  @ApiProperty({ type: [AnalisisPreguntaDto] })
  preguntasMasDisruptivas: AnalisisPreguntaDto[];
  @ApiProperty({ type: [String] }) patronesDePensamiento: string[];
  @ApiProperty({ type: [String] }) insightsDerivados: string[];
  @ApiProperty({ type: [String] }) temasEmergentes: string[];
  @ApiProperty({ type: [String] }) recommendations: string[];
}

export class WhatIfAnalyzeResDto {
  @ApiProperty() version: number;
  @ApiProperty() generatedAt: string;
  @ApiProperty({ type: WhatIfReportDto }) report: WhatIfReportDto;
}
