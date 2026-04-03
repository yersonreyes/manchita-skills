import { ApiProperty } from '@nestjs/swagger';

export class HipotesisDto {
  @ApiProperty() hipotesis: string;
  @ApiProperty() evidencia: string;
}

export class PrototipoPensarReportDto {
  @ApiProperty() executiveSummary: string;
  @ApiProperty() evolucionDelPensamiento: string;
  @ApiProperty({ type: [HipotesisDto] }) hipotesisValidadas: HipotesisDto[];
  @ApiProperty({ type: [HipotesisDto] }) hipotesisDescartadas: HipotesisDto[];
  @ApiProperty({ type: [String] }) aprendizajesClave: string[];
  @ApiProperty() estadoConfianza: string;
  @ApiProperty({ type: [String] }) recommendations: string[];
}

export class PrototipoPensarAnalyzeResDto {
  @ApiProperty() version: number;
  @ApiProperty() generatedAt: string;
  @ApiProperty({ type: PrototipoPensarReportDto }) report: PrototipoPensarReportDto;
}
