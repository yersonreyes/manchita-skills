import { ApiProperty } from '@nestjs/swagger';

export class AnalisisCuadranteDto {
  @ApiProperty({ example: 'AHORA' })
  cuadrante: string;

  @ApiProperty({ type: [String], example: ['Open Banking', 'Neobanks'] })
  tendencias: string[];

  @ApiProperty()
  estrategia: string;
}

export class MatrizTendenciasReportDto {
  @ApiProperty()
  executiveSummary: string;

  @ApiProperty({ type: [AnalisisCuadranteDto] })
  analisisPorCuadrante: AnalisisCuadranteDto[];

  @ApiProperty({ type: [String] })
  tendenciasClaves: string[];

  @ApiProperty({ type: [String] })
  insightsEstrategicos: string[];

  @ApiProperty({ type: [String] })
  riesgosIdentificados: string[];

  @ApiProperty({ type: [String] })
  oportunidades: string[];

  @ApiProperty({ type: [String] })
  recommendations: string[];
}

export class MatrizTendenciasAnalyzeResDto {
  @ApiProperty()
  version: number;

  @ApiProperty()
  generatedAt: string;

  @ApiProperty({ type: MatrizTendenciasReportDto })
  report: MatrizTendenciasReportDto;
}
