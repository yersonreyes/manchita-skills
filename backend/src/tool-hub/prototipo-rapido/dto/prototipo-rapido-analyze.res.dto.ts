import { ApiProperty } from '@nestjs/swagger';

export class PrototipoRapidoReportDto {
  @ApiProperty() executiveSummary: string;
  @ApiProperty() validezDeLaHipotesis: string;
  @ApiProperty() tasaExitoCalculada: string;
  @ApiProperty({ type: [String] }) patronesEnElFeedback: string[];
  @ApiProperty({ type: [String] }) hipotesisConfirmadas: string[];
  @ApiProperty({ type: [String] }) hipotesisRefutadas: string[];
  @ApiProperty({ type: [String] }) riesgosRestantes: string[];
  @ApiProperty({ type: [String] }) recommendations: string[];
}

export class PrototipoRapidoAnalyzeResDto {
  @ApiProperty() version: number;
  @ApiProperty() generatedAt: string;
  @ApiProperty({ type: PrototipoRapidoReportDto }) report: PrototipoRapidoReportDto;
}
