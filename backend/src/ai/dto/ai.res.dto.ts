import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional } from 'class-validator';

export class AiAnalysisDto {
  @ApiProperty({ example: 'El análisis de causa raíz reveló...' })
  @IsString()
  summary: string;

  @ApiProperty({ example: 'La causa raíz es X porque...' })
  @IsString()
  rootCause: string;

  @ApiProperty({
    example: ['Insight 1', 'Insight 2', 'Insight 3'],
    description: '3-5 insights clave identificados',
  })
  @IsArray()
  @IsString({ each: true })
  insights: string[];

  @ApiProperty({
    example: ['Recomendación 1', 'Recomendación 2'],
    description: '2-4 recomendaciones accionables',
  })
  @IsArray()
  @IsString({ each: true })
  recommendations: string[];
}

export class AiChatResDto {
  @ApiProperty({ example: 'Tu respuesta es... ¿Por qué crees que X?' })
  @IsString()
  assistantMessage: string;

  @ApiProperty({
    example: 2,
    description: 'Número de intercambios completados',
  })
  turnCount: number;
}

export class AiAnalyzeResDto {
  @ApiProperty()
  analysis: AiAnalysisDto;
}
