import { ApiProperty } from '@nestjs/swagger';

export class CincoPorquesChatResDto {
  @ApiProperty({ example: '¿Por qué crees que X ocurre en ese contexto?' })
  assistantMessage: string;

  @ApiProperty({ example: 2 })
  turnCount: number;
}

export class CincoPorquesAnalysisDto {
  @ApiProperty({ example: 'El análisis reveló que la causa raíz es...' })
  summary: string;

  @ApiProperty({ example: 'La causa raíz es la falta de confianza en el proceso de pago' })
  rootCause: string;

  @ApiProperty({ example: ['Insight 1', 'Insight 2'] })
  insights: string[];

  @ApiProperty({ example: ['Recomendación 1', 'Recomendación 2'] })
  recommendations: string[];
}

export class CincoPorquesAnalyzeResDto {
  @ApiProperty()
  analysis: CincoPorquesAnalysisDto;
}
