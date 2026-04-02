import { ApiProperty } from '@nestjs/swagger';

export class AnalisisEtapaActivoDto {
  @ApiProperty() etapa: string;
  @ApiProperty() momentoClave: string;
  @ApiProperty() oportunidadPrioritaria: string;
  @ApiProperty() implicacion: string;
}

export class MapaActivoReportDto {
  @ApiProperty() executiveSummary: string;
  @ApiProperty({ type: [AnalisisEtapaActivoDto] }) analisisPorEtapa: AnalisisEtapaActivoDto[];
  @ApiProperty({ type: [String] }) momentosCriticos: string[];
  @ApiProperty({ type: [String] }) touchpointsPrioritarios: string[];
  @ApiProperty({ type: [String] }) mapaDeOportunidades: string[];
  @ApiProperty({ type: [String] }) patronesDeComportamiento: string[];
  @ApiProperty({ type: [String] }) recommendations: string[];
}

export class MapaActivoExperienciaAnalyzeResDto {
  @ApiProperty() version: number;
  @ApiProperty() generatedAt: string;
  @ApiProperty({ type: MapaActivoReportDto }) report: MapaActivoReportDto;
}
