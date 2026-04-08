import { ApiProperty } from '@nestjs/swagger';

export class DiagnosticoForceDto {
  @ApiProperty({ enum: ['BAJA', 'MEDIA', 'ALTA'] })
  intensity: 'BAJA' | 'MEDIA' | 'ALTA';

  @ApiProperty()
  analysis: string;

  @ApiProperty({ type: [String] })
  implications: string[];
}

export class DiagnosticoForceAnalysisDto {
  @ApiProperty({ type: DiagnosticoForceDto })
  rivalidad: DiagnosticoForceDto;

  @ApiProperty({ type: DiagnosticoForceDto })
  nuevosEntrantes: DiagnosticoForceDto;

  @ApiProperty({ type: DiagnosticoForceDto })
  proveedores: DiagnosticoForceDto;

  @ApiProperty({ type: DiagnosticoForceDto })
  clientes: DiagnosticoForceDto;

  @ApiProperty({ type: DiagnosticoForceDto })
  sustitutos: DiagnosticoForceDto;
}

export class DiagnosticoReportDto {
  @ApiProperty()
  executiveSummary: string;

  @ApiProperty({ type: DiagnosticoForceAnalysisDto })
  forceAnalysis: DiagnosticoForceAnalysisDto;

  @ApiProperty({
    example: 6,
    description:
      'Atractivo de la industria: 1 (muy hostil) a 10 (muy atractiva)',
  })
  industryScore: number;

  @ApiProperty({ type: [String] })
  keyOpportunities: string[];

  @ApiProperty({ type: [String] })
  keyRisks: string[];

  @ApiProperty()
  strategicPosition: string;

  @ApiProperty({ type: [String] })
  recommendations: string[];
}

export class DiagnosticoIndustriaResDto {
  @ApiProperty({ example: 1 })
  version: number;

  @ApiProperty({ example: '2026-03-29T12:00:00.000Z' })
  generatedAt: string;

  @ApiProperty({ type: DiagnosticoReportDto })
  report: DiagnosticoReportDto;
}
