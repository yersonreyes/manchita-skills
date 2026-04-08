import { ApiProperty } from '@nestjs/swagger';

export class CjmEtapaAnalisisDto {
  @ApiProperty({ example: 'Descubrimiento' })
  etapa: string;

  @ApiProperty({ example: 'Curiosa' })
  emocionPredominante: string;

  @ApiProperty({ example: 'bajo', enum: ['bajo', 'medio', 'alto'] })
  nivelFriccion: 'bajo' | 'medio' | 'alto';

  @ApiProperty({
    example: 'El usuario llega con expectativas altas pero poca información.',
  })
  insight: string;
}

export class CustomerJourneyMapReportDto {
  @ApiProperty({
    example: 'El journey revela una experiencia con picos emocionales...',
  })
  executiveSummary: string;

  @ApiProperty({
    type: [String],
    example: ['En el checkout el usuario decide abandonar o comprar'],
  })
  momentosDeLaVerdad: string[];

  @ApiProperty({ type: [CjmEtapaAnalisisDto] })
  etapasAnalisis: CjmEtapaAnalisisDto[];

  @ApiProperty({ type: [String], example: ['Proceso de checkout confuso'] })
  painPointsCriticos: string[];

  @ApiProperty({
    type: [String],
    example: ['Simplificar el onboarding en 3 pasos'],
  })
  oportunidadesPriorizadas: string[];

  @ApiProperty({
    type: [String],
    example: ['Implementar progress bar en checkout'],
  })
  recommendations: string[];
}

export class CustomerJourneyMapAnalyzeResDto {
  @ApiProperty({ example: 1 })
  version: number;

  @ApiProperty({ example: '2026-04-01T12:00:00.000Z' })
  generatedAt: string;

  @ApiProperty({ type: CustomerJourneyMapReportDto })
  report: CustomerJourneyMapReportDto;
}
