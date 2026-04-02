import { ApiProperty } from '@nestjs/swagger';

export class DistribucionCuadranteDto {
  @ApiProperty()
  cuadrante: string;

  @ApiProperty({ type: [String] })
  items: string[];

  @ApiProperty()
  interpretacion: string;
}

export class AnalisisItemDto {
  @ApiProperty()
  nombre: string;

  @ApiProperty()
  cuadrante: string;

  @ApiProperty()
  justificacion: string;
}

export class Matriz2x2ReportDto {
  @ApiProperty()
  executiveSummary: string;

  @ApiProperty({ type: [DistribucionCuadranteDto] })
  distribucionPorCuadrante: DistribucionCuadranteDto[];

  @ApiProperty({ type: [AnalisisItemDto] })
  itemsPrioritarios: AnalisisItemDto[];

  @ApiProperty({ type: [AnalisisItemDto] })
  itemsAEvitar: AnalisisItemDto[];

  @ApiProperty({ type: [String] })
  patronesIdentificados: string[];

  @ApiProperty({ type: [String] })
  oportunidades: string[];

  @ApiProperty({ type: [String] })
  recommendations: string[];
}

export class Matriz2x2AnalyzeResDto {
  @ApiProperty({ example: 1 })
  version: number;

  @ApiProperty({ example: '2026-03-30T12:00:00.000Z' })
  generatedAt: string;

  @ApiProperty({ type: Matriz2x2ReportDto })
  report: Matriz2x2ReportDto;
}
