import { ApiProperty } from '@nestjs/swagger';

export class BenchmarkingBrechaDto {
  @ApiProperty({ example: 'Onboarding' })
  criterio: string;

  @ApiProperty({ enum: ['ventaja', 'paridad', 'brecha'] })
  estado: 'ventaja' | 'paridad' | 'brecha';

  @ApiProperty({ example: 'Tu onboarding tarda 4 min vs 2 min de Robinhood.' })
  observacion: string;
}

export class BenchmarkingReportDto {
  @ApiProperty({ example: 'El análisis revela una posición competitiva media...' })
  executiveSummary: string;

  @ApiProperty({ example: 'Producto en desarrollo con ventaja en educación integrada pero brecha en UX.' })
  posicionamiento: string;

  @ApiProperty({ type: [BenchmarkingBrechaDto] })
  brechas: BenchmarkingBrechaDto[];

  @ApiProperty({ type: [String], example: ['Educación integrada única en el mercado'] })
  ventajasCompetitivas: string[];

  @ApiProperty({ type: [String], example: ['Onboarding 2x más lento que el líder'] })
  amenazas: string[];

  @ApiProperty({ type: [String], example: ['Ningún competidor combina simplicidad con educación'] })
  oportunidadesDeDiferenciacion: string[];

  @ApiProperty({ type: [String], example: ['Reducir el onboarding a 2 pasos clave'] })
  recommendations: string[];
}

export class BenchmarkingAnalyzeResDto {
  @ApiProperty({ example: 1 })
  version: number;

  @ApiProperty({ example: '2026-04-01T12:00:00.000Z' })
  generatedAt: string;

  @ApiProperty({ type: BenchmarkingReportDto })
  report: BenchmarkingReportDto;
}
