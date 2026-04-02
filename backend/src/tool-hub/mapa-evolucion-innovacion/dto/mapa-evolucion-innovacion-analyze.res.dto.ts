import { ApiProperty } from '@nestjs/swagger';

export class AnalisisEraDto {
  @ApiProperty()
  era: string;

  @ApiProperty()
  periodo: string;

  @ApiProperty()
  patronInnovacion: string;

  @ApiProperty()
  relevanciaActual: string;
}

export class MapaEvolucionReportDto {
  @ApiProperty()
  executiveSummary: string;

  @ApiProperty({ type: [AnalisisEraDto] })
  analisisPorEra: AnalisisEraDto[];

  @ApiProperty({ type: [String] })
  patronesEvolutivos: string[];

  @ApiProperty({ type: [String] })
  puntosInflexionCriticos: string[];

  @ApiProperty({ type: [String] })
  gapsIdentificados: string[];

  @ApiProperty({ type: [String] })
  oportunidadesDeInnovacion: string[];

  @ApiProperty({ type: [String] })
  recommendations: string[];
}

export class MapaEvolucionInnovacionAnalyzeResDto {
  @ApiProperty()
  version: number;

  @ApiProperty()
  generatedAt: string;

  @ApiProperty({ type: MapaEvolucionReportDto })
  report: MapaEvolucionReportDto;
}
