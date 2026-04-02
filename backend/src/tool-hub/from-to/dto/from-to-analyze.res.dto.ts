import { ApiProperty } from '@nestjs/swagger';

export class TransformacionAnalisisDto {
  @ApiProperty()
  from: string;

  @ApiProperty()
  to: string;

  @ApiProperty()
  brecha: string;
}

export class FromToReportDto {
  @ApiProperty()
  executiveSummary: string;

  @ApiProperty()
  analisisFrom: string;

  @ApiProperty()
  analisisTo: string;

  @ApiProperty({ type: [TransformacionAnalisisDto] })
  transformacionesDestacadas: TransformacionAnalisisDto[];

  @ApiProperty({ type: [String] })
  brechasCriticas: string[];

  @ApiProperty({ type: [String] })
  insightsEstrategicos: string[];

  @ApiProperty({ type: [String] })
  oportunidades: string[];

  @ApiProperty({ type: [String] })
  recommendations: string[];
}

export class FromToAnalyzeResDto {
  @ApiProperty()
  version: number;

  @ApiProperty()
  generatedAt: string;

  @ApiProperty({ type: FromToReportDto })
  report: FromToReportDto;
}
