import { ApiProperty } from '@nestjs/swagger';

export class TensionPerspectivaDto {
  @ApiProperty({ type: [String] }) perspectivas: string[];
  @ApiProperty() tension: string;
  @ApiProperty() implicancia: string;
}

export class Perspectiva360ReportDto {
  @ApiProperty() executiveSummary: string;
  @ApiProperty({ type: [String] }) insightsClave: string[];
  @ApiProperty({ type: [TensionPerspectivaDto] })
  tensionesDetectadas: TensionPerspectivaDto[];
  @ApiProperty() perspectivaMasRiesgosa: string;
  @ApiProperty() perspectivaMasOportunidad: string;
  @ApiProperty() brechaCritica: string;
  @ApiProperty({ type: [String] }) oportunidades: string[];
  @ApiProperty({ type: [String] }) recommendations: string[];
}

export class Perspectiva360AnalyzeResDto {
  @ApiProperty() version: number;
  @ApiProperty() generatedAt: string;
  @ApiProperty({ type: Perspectiva360ReportDto })
  report: Perspectiva360ReportDto;
}
