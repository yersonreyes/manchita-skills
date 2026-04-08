import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class IdeaAnalisisDto {
  @ApiProperty() grupo: string;
  @ApiProperty() descripcion: string;
  @ApiProperty() potencialInnovador: string;
  @ApiPropertyOptional() viabilidad: string;
}

export class SesionCocreacionReportDto {
  @ApiProperty() executiveSummary: string;
  @ApiProperty({ type: [IdeaAnalisisDto] }) ideasDestacadas: IdeaAnalisisDto[];
  @ApiProperty({ type: [String] }) patronesEmergentes: string[];
  @ApiProperty({ type: [String] }) tensionesCreativas: string[];
  @ApiProperty({ type: [String] }) oportunidadesDesarrollo: string[];
  @ApiProperty({ type: [String] }) recommendations: string[];
}

export class SesionCocreacionAnalyzeResDto {
  @ApiProperty() version: number;
  @ApiProperty() generatedAt: string;
  @ApiProperty({ type: SesionCocreacionReportDto })
  report: SesionCocreacionReportDto;
}
