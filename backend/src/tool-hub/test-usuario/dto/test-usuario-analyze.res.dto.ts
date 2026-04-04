import { ApiProperty } from '@nestjs/swagger';

export class TestUsuarioReportDto {
  @ApiProperty() executiveSummary: string;
  @ApiProperty() tasaExitoGlobal: string;
  @ApiProperty({ type: [String] }) problemasRecurrentes: string[];
  @ApiProperty({ type: [String] }) hallazgosDestacados: string[];
  @ApiProperty({ type: [String] }) citasRelevantes: string[];
  @ApiProperty({ type: [String] }) patronesComportamiento: string[];
  @ApiProperty({ type: [String] }) recommendations: string[];
}

export class TestUsuarioAnalyzeResDto {
  @ApiProperty({ example: 1 }) version: number;
  @ApiProperty({ example: '2026-04-03T12:00:00.000Z' }) generatedAt: string;
  @ApiProperty({ type: TestUsuarioReportDto }) report: TestUsuarioReportDto;
}
