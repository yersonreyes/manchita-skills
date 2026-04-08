import { ApiProperty } from '@nestjs/swagger';

export class AnalogoInsightDto {
  @ApiProperty({ example: 'Aviación' })
  industria: string;

  @ApiProperty({ example: 'Optimización de flujos mediante slots temporales' })
  principio: string;

  @ApiProperty({
    example: 'Implementar ventanas de entrega fijas para reducir incertidumbre',
  })
  potencial: string;
}

export class AntilogoLessonDto {
  @ApiProperty({ example: 'Retail' })
  industria: string;

  @ApiProperty({
    example: 'Dependencia exclusiva del precio destruyó márgenes y lealtad',
  })
  leccion: string;

  @ApiProperty({
    example:
      'Construir propuesta de valor multidimensional más allá del precio',
  })
  safeguard: string;
}

export class AnalogosAntilogosReportDto {
  @ApiProperty({
    example: 'El análisis revela oportunidades de innovación disruptiva...',
  })
  executiveSummary: string;

  @ApiProperty({ type: [AnalogoInsightDto] })
  analogoInsights: AnalogoInsightDto[];

  @ApiProperty({ type: [AntilogoLessonDto] })
  antilogoLessons: AntilogoLessonDto[];

  @ApiProperty({
    example: [
      'Priorizar experiencia sobre precio',
      'Inspirarse en sistemas de gestión de flujo',
    ],
  })
  synthesisPrinciples: string[];

  @ApiProperty({
    example: [
      'Implementar sistema de slots de entrega en las próximas 4 semanas',
    ],
  })
  recommendations: string[];
}

export class AnalogosAntilogosAnalyzeResDto {
  @ApiProperty({ example: 1 })
  version: number;

  @ApiProperty({ example: '2026-03-30T12:00:00.000Z' })
  generatedAt: string;

  @ApiProperty({ type: AnalogosAntilogosReportDto })
  report: AnalogosAntilogosReportDto;
}
