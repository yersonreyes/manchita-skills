import { ApiProperty } from '@nestjs/swagger';

export class MvpReportDto {
  @ApiProperty() executiveSummary: string;
  @ApiProperty() validezHipotesis: string;
  @ApiProperty() evaluacionScope: string;
  @ApiProperty() calidadMetricas: string;
  @ApiProperty() estadoValidacion: string;
  @ApiProperty({ type: [String] }) recommendations: string[];
}

export class MvpAnalyzeResDto {
  @ApiProperty() version: number;
  @ApiProperty() generatedAt: string;
  @ApiProperty({ type: MvpReportDto }) report: MvpReportDto;
}
