import { ApiProperty } from '@nestjs/swagger';

export class IssuePriorizadoDto {
  @ApiProperty() issue: string;
  @ApiProperty() impacto: string;
  @ApiProperty() canal: string;
  @ApiProperty() prioridad: string;
}

export class ClienteMisteriosoReportDto {
  @ApiProperty() executiveSummary: string;
  @ApiProperty({ type: [IssuePriorizadoDto] }) issuesPriorizados: IssuePriorizadoDto[];
  @ApiProperty({ type: [String] }) patronesDeExperiencia: string[];
  @ApiProperty({ type: [String] }) fortalezasDetectadas: string[];
  @ApiProperty({ type: [String] }) friccionesCriticas: string[];
  @ApiProperty() scorePromedioAnalisis: string;
  @ApiProperty({ type: [String] }) oportunidades: string[];
  @ApiProperty({ type: [String] }) recommendations: string[];
}

export class ClienteMisteriosoAnalyzeResDto {
  @ApiProperty() version: number;
  @ApiProperty() generatedAt: string;
  @ApiProperty({ type: ClienteMisteriosoReportDto }) report: ClienteMisteriosoReportDto;
}
