import { ApiProperty } from '@nestjs/swagger';

export class RoadmapPrototipadoReportDto {
  @ApiProperty() executiveSummary: string;
  @ApiProperty() evaluacionEstrategia: string;
  @ApiProperty({ type: [String] }) riesgosTimeline: string[];
  @ApiProperty({ type: [String] }) bottlenecks: string[];
  @ApiProperty() prioridadRecomendada: string;
  @ApiProperty({ type: [String] }) recommendations: string[];
}

export class RoadmapPrototipadoAnalyzeResDto {
  @ApiProperty() version: number;
  @ApiProperty() generatedAt: string;
  @ApiProperty({ type: RoadmapPrototipadoReportDto }) report: RoadmapPrototipadoReportDto;
}
