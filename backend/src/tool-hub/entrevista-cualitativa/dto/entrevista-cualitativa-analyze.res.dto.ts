import { ApiProperty } from '@nestjs/swagger';

export class EntrevistaCualitativaInsightDto {
  @ApiProperty() categoria: string;
  @ApiProperty() insight: string;
  @ApiProperty() evidencia: string;
}

export class EntrevistaCualitativaReportDto {
  @ApiProperty() executiveSummary: string;
  @ApiProperty() perfilEntrevistado: string;
  @ApiProperty({ type: [EntrevistaCualitativaInsightDto] })
  insights: EntrevistaCualitativaInsightDto[];
  @ApiProperty({ type: [String] }) necesidadesDetectadas: string[];
  @ApiProperty({ type: [String] }) painPoints: string[];
  @ApiProperty({ type: [String] }) motivaciones: string[];
  @ApiProperty({ type: [String] }) citasDestacadas: string[];
  @ApiProperty({ type: [String] }) recommendations: string[];
}

export class EntrevistaCualitativaAnalyzeResDto {
  @ApiProperty() version: number;
  @ApiProperty() generatedAt: string;
  @ApiProperty({ type: EntrevistaCualitativaReportDto })
  report: EntrevistaCualitativaReportDto;
}
