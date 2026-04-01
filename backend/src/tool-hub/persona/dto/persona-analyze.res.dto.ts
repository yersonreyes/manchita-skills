import { ApiProperty } from '@nestjs/swagger';

export class PersonaReportDto {
  @ApiProperty({ example: 'María representa a una profesional joven con capacidad de ahorro...' })
  executiveSummary: string;

  @ApiProperty({ type: [String], example: ['Priorizar lenguaje cotidiano sobre jerga técnica'] })
  insightsDeDiseno: string[];

  @ApiProperty({ type: [String], example: ['Crear onboarding educativo en formato video corto'] })
  oportunidades: string[];

  @ApiProperty({ type: [String], example: ['Simplificar la terminología financiera en toda la UI'] })
  recommendations: string[];
}

export class PersonaAnalyzeResDto {
  @ApiProperty({ example: 1 })
  version: number;

  @ApiProperty({ example: '2026-04-01T12:00:00.000Z' })
  generatedAt: string;

  @ApiProperty({ type: PersonaReportDto })
  report: PersonaReportDto;
}
