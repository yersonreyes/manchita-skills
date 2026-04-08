import { ApiProperty } from '@nestjs/swagger';

export class InOutReportDto {
  @ApiProperty({ description: 'Resumen ejecutivo del análisis del diagrama' })
  executiveSummary: string;

  @ApiProperty({
    type: [String],
    description:
      'Inputs que no fueron considerados y podrían impactar el sistema',
  })
  inputsOcultos: string[];

  @ApiProperty({
    type: [String],
    description:
      'Outputs que no fueron considerados y el sistema genera implícitamente',
  })
  outputsOcultos: string[];

  @ApiProperty({
    type: [String],
    description: 'Brechas o desconexiones en el flujo del sistema',
  })
  gapsIdentificados: string[];

  @ApiProperty({
    type: [String],
    description: 'Recomendaciones priorizadas para mejorar el sistema',
  })
  recommendations: string[];
}

export class InOutAnalyzeResDto {
  @ApiProperty({ example: 1 })
  version: number;

  @ApiProperty({ example: '2026-03-30T12:00:00.000Z' })
  generatedAt: string;

  @ApiProperty({ type: InOutReportDto })
  report: InOutReportDto;
}
