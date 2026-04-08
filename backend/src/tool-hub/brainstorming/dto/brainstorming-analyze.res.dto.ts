import { ApiProperty } from '@nestjs/swagger';

export class AnalisisTopIdeaDto {
  @ApiProperty() idea: string;
  @ApiProperty() potencial: string;
  @ApiProperty() riesgos: string;
  @ApiProperty() siguientesPasos: string;
}

export class BrainstormingReportDto {
  @ApiProperty() executiveSummary: string;
  @ApiProperty() calidadSesion: string;
  @ApiProperty({ type: [AnalisisTopIdeaDto] })
  analisisTopIdeas: AnalisisTopIdeaDto[];
  @ApiProperty({ type: [String] }) clustersDestacados: string[];
  @ApiProperty({ type: [String] }) ideasInnovadoras: string[];
  @ApiProperty({ type: [String] }) ideasAExplorar: string[];
  @ApiProperty({ type: [String] }) recommendations: string[];
}

export class BrainstormingAnalyzeResDto {
  @ApiProperty() version: number;
  @ApiProperty() generatedAt: string;
  @ApiProperty({ type: BrainstormingReportDto }) report: BrainstormingReportDto;
}
