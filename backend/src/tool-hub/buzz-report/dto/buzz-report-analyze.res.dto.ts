import { ApiProperty } from '@nestjs/swagger';

export class BuzzReportSentimentBreakdownDto {
  @ApiProperty() positivo: number;
  @ApiProperty() neutro: number;
  @ApiProperty() negativo: number;
}

export class BuzzReportCanalInsightDto {
  @ApiProperty() canal: string;
  @ApiProperty() volumen: string;
  @ApiProperty() sentiment: string;
  @ApiProperty() insight: string;
}

export class BuzzReportReportDto {
  @ApiProperty() executiveSummary: string;
  @ApiProperty({ type: BuzzReportSentimentBreakdownDto }) sentimentBreakdown: BuzzReportSentimentBreakdownDto;
  @ApiProperty() sentimentNarrative: string;
  @ApiProperty({ type: [BuzzReportCanalInsightDto] }) topCanales: BuzzReportCanalInsightDto[];
  @ApiProperty({ type: [String] }) temasPrincipales: string[];
  @ApiProperty({ type: [String] }) vocesInfluyentes: string[];
  @ApiProperty({ type: [String] }) oportunidades: string[];
  @ApiProperty({ type: [String] }) riesgos: string[];
  @ApiProperty({ type: [String] }) recommendations: string[];
}

export class BuzzReportAnalyzeResDto {
  @ApiProperty() version: number;
  @ApiProperty() generatedAt: string;
  @ApiProperty({ type: BuzzReportReportDto }) report: BuzzReportReportDto;
}
