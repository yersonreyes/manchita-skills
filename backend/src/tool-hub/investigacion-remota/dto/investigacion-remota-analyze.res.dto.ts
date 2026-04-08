import { ApiProperty } from '@nestjs/swagger';

export class HallazgoRemotoDto {
  @ApiProperty() metodo: string;
  @ApiProperty() hallazgo: string;
  @ApiProperty() implicancia: string;
}

export class InvestigacionRemotaReportDto {
  @ApiProperty() executiveSummary: string;
  @ApiProperty({ type: [HallazgoRemotoDto] })
  hallazgosClave: HallazgoRemotoDto[];
  @ApiProperty({ type: [String] }) patronesEncontrados: string[];
  @ApiProperty({ type: [String] }) insightsAccionables: string[];
  @ApiProperty({ type: [String] }) limitacionesDetectadas: string[];
  @ApiProperty({ type: [String] }) oportunidades: string[];
  @ApiProperty({ type: [String] }) recommendations: string[];
}

export class InvestigacionRemotaAnalyzeResDto {
  @ApiProperty() version: number;
  @ApiProperty() generatedAt: string;
  @ApiProperty({ type: InvestigacionRemotaReportDto })
  report: InvestigacionRemotaReportDto;
}
