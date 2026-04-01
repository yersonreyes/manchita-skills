import { ApiProperty } from '@nestjs/swagger';

export class RolePlayChatResDto {
  @ApiProperty({ example: '[Juan]: Hola, quisiera solicitar una tarjeta de crédito.' })
  assistantMessage: string;

  @ApiProperty({ example: 2 })
  turnCount: number;
}

export class RolePlayAnalysisDto {
  @ApiProperty({ example: 'La simulación reveló que el proceso de onboarding genera fricción por falta de guía contextual.' })
  summary: string;

  @ApiProperty({ type: [String], example: ['El usuario asume que no entendió = no es posible'] })
  insights: string[];

  @ApiProperty({ type: [String], example: ['El chatbot no comprende vocabulario de autónomos'] })
  painPoints: string[];

  @ApiProperty({ type: [String], example: ['Agregar opción de hablar con agente desde el chatbot'] })
  recommendations: string[];
}

export class RolePlayAnalyzeResDto {
  @ApiProperty({ type: RolePlayAnalysisDto })
  analysis: RolePlayAnalysisDto;
}
