import { ApiProperty } from '@nestjs/swagger';

export class BriefReportDto {
  @ApiProperty() executiveSummary: string;
  @ApiProperty({ type: [String] }) fortalezas: string[];
  @ApiProperty({ type: [String] }) gapsCriticos: string[];
  @ApiProperty({ type: [String] }) alertas: string[];
  @ApiProperty({ type: [String] }) sugerenciasScope: string[];
  @ApiProperty({ type: [String] }) recommendations: string[];
}

export class BriefAnalyzeResDto {
  @ApiProperty() version: number;
  @ApiProperty() generatedAt: string;
  @ApiProperty({ type: BriefReportDto }) report: BriefReportDto;
}
