import { ApiProperty } from '@nestjs/swagger';

export class SistemaReportDto {
  @ApiProperty({ description: 'Síntesis del ecosistema analizado y hallazgos principales' })
  executiveSummary: string;

  @ApiProperty({ type: [String], description: 'Actores centrales y su rol en el sistema' })
  actoresClave: string[];

  @ApiProperty({ type: [String], description: 'Flujos críticos que mantienen o disrumpen el sistema' })
  flujosImportantes: string[];

  @ApiProperty({ type: [String], description: 'Bucles de retroalimentación identificados (refuerzo o equilibrio)' })
  buclesIdentificados: string[];

  @ApiProperty({ type: [String], description: 'Puntos donde un pequeño cambio tiene gran impacto' })
  puntasDePalanca: string[];

  @ApiProperty({ type: [String], description: 'Recomendaciones priorizadas por impacto potencial' })
  recommendations: string[];
}

export class DiagramaSistemaAnalyzeResDto {
  @ApiProperty({ example: 1 })
  version: number;

  @ApiProperty({ example: '2026-03-31T12:00:00.000Z' })
  generatedAt: string;

  @ApiProperty({ type: SistemaReportDto })
  report: SistemaReportDto;
}
