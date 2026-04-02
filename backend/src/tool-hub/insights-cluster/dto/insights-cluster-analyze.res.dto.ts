import { ApiProperty } from '@nestjs/swagger';

export class AnalisisClusterDto {
  @ApiProperty()
  cluster: string;

  @ApiProperty({ type: [String] })
  insightsClave: string[];

  @ApiProperty()
  patron: string;

  @ApiProperty()
  implicacion: string;
}

export class InsightsClusterReportDto {
  @ApiProperty()
  executiveSummary: string;

  @ApiProperty({ type: [AnalisisClusterDto] })
  analisisPorCluster: AnalisisClusterDto[];

  @ApiProperty()
  clusterPrioritario: string;

  @ApiProperty({ type: [String] })
  patronesGlobales: string[];

  @ApiProperty({ type: [String] })
  tensionesEntreGrupos: string[];

  @ApiProperty({ type: [String] })
  oportunidadesPrioritarias: string[];

  @ApiProperty({ type: [String] })
  recommendations: string[];
}

export class InsightsClusterAnalyzeResDto {
  @ApiProperty({ example: 1 })
  version: number;

  @ApiProperty({ example: '2026-03-30T12:00:00.000Z' })
  generatedAt: string;

  @ApiProperty({ type: InsightsClusterReportDto })
  report: InsightsClusterReportDto;
}
