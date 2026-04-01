import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BenchmarkingCriterioDto {
  @ApiProperty({ example: 'uuid-criterio' })
  @IsString()
  id: string;

  @ApiPropertyOptional({ example: 'Onboarding' })
  @IsOptional()
  @IsString()
  nombre?: string;
}

export class BenchmarkingCompetidorDto {
  @ApiProperty({ example: 'uuid-comp' })
  @IsString()
  id: string;

  @ApiPropertyOptional({ example: 'Robinhood' })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiProperty({ description: 'criterioId → valor', example: { 'uuid-criterio': '★★★★★' } })
  @IsObject()
  valores: Record<string, string>;
}

export class BenchmarkingDataDto {
  @ApiPropertyOptional({ example: 'Apps de inversión para fintechs' })
  @IsOptional()
  @IsString()
  contexto?: string;

  @ApiPropertyOptional({ example: 'InvestApp' })
  @IsOptional()
  @IsString()
  miProducto?: string;

  @ApiProperty({ description: 'criterioId → valor de tu producto', example: {} })
  @IsObject()
  miValores: Record<string, string>;

  @ApiProperty({ type: [BenchmarkingCriterioDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BenchmarkingCriterioDto)
  criterios: BenchmarkingCriterioDto[];

  @ApiProperty({ type: [BenchmarkingCompetidorDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BenchmarkingCompetidorDto)
  competidores: BenchmarkingCompetidorDto[];
}

export class BenchmarkingAnalyzeReqDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  toolApplicationId: number;

  @ApiProperty({ type: BenchmarkingDataDto })
  @ValidateNested()
  @Type(() => BenchmarkingDataDto)
  data: BenchmarkingDataDto;

  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  currentVersion: number;
}
