import { ApiProperty } from '@nestjs/swagger';

export class MapaEmpatiaReportDto {
  @ApiProperty({ description: 'Síntesis del perfil empático del usuario' })
  executiveSummary: string;

  @ApiProperty({
    type: [String],
    description:
      'Tensiones entre lo que dice y lo que hace, o piensa vs siente',
  })
  tensionesClaves: string[];

  @ApiProperty({
    type: [String],
    description: 'Insights accionables para el diseño',
  })
  insightsDeDiseno: string[];

  @ApiProperty({
    type: [String],
    description: 'Oportunidades de diseño detectadas',
  })
  oportunidades: string[];

  @ApiProperty({
    type: [String],
    description: 'Recomendaciones concretas para el equipo de diseño',
  })
  recommendations: string[];
}

export class MapaEmpatiaAnalyzeResDto {
  @ApiProperty({ example: 1 })
  version: number;

  @ApiProperty({ example: '2026-04-01T12:00:00.000Z' })
  generatedAt: string;

  @ApiProperty({ type: MapaEmpatiaReportDto })
  report: MapaEmpatiaReportDto;
}
