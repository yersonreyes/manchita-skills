import { ApiProperty } from '@nestjs/swagger';

export class TestCuantitativoReportDto {
  @ApiProperty() executiveSummary: string;
  @ApiProperty() scoreGlobal: string;
  @ApiProperty({ type: [String] }) tareasAnalisis: string[];
  @ApiProperty({ type: [String] }) patrones: string[];
  @ApiProperty({ type: [String] }) fortalezas: string[];
  @ApiProperty({ type: [String] }) debilidades: string[];
  @ApiProperty({ type: [String] }) recommendations: string[];
}

export class TestCuantitativoAnalyzeResDto {
  @ApiProperty({ example: 1 }) version: number;
  @ApiProperty({ example: '2026-04-03T12:00:00.000Z' }) generatedAt: string;
  @ApiProperty({ type: TestCuantitativoReportDto }) report: TestCuantitativoReportDto;
}
