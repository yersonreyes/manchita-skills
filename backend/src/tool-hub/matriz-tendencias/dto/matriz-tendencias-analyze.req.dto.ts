import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export enum TendenciaImpactoEnum {
  ALTO = 'alto',
  BAJO = 'bajo',
}

export enum TendenciaPlazoEnum {
  CORTO = 'corto',
  LARGO = 'largo',
}

export enum TendenciaCategoriaEnum {
  TECNOLOGICA = 'tecnologica',
  SOCIAL = 'social',
  ECONOMICA = 'economica',
  REGULATORIA = 'regulatoria',
  MERCADO = 'mercado',
}

export class TendenciaDto {
  @ApiProperty({ example: 'abc-123' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'AI en servicios financieros' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: 'Los modelos de lenguaje están siendo adoptados...', required: false })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ enum: TendenciaCategoriaEnum, example: 'tecnologica' })
  @IsEnum(TendenciaCategoriaEnum)
  categoria: TendenciaCategoriaEnum;

  @ApiProperty({ enum: TendenciaImpactoEnum, example: 'alto' })
  @IsEnum(TendenciaImpactoEnum)
  impacto: TendenciaImpactoEnum;

  @ApiProperty({ enum: TendenciaPlazoEnum, example: 'largo' })
  @IsEnum(TendenciaPlazoEnum)
  plazo: TendenciaPlazoEnum;
}

export class MatrizTendenciasDataDto {
  @ApiProperty({ example: 'Fintech planificando roadmap 2025-2026', required: false })
  @IsString()
  @IsOptional()
  contexto?: string;

  @ApiProperty({ type: [TendenciaDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TendenciaDto)
  tendencias: TendenciaDto[];
}

export class MatrizTendenciasAnalyzeReqDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  toolApplicationId: number;

  @ApiProperty({ type: MatrizTendenciasDataDto })
  @ValidateNested()
  @Type(() => MatrizTendenciasDataDto)
  data: MatrizTendenciasDataDto;

  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  currentVersion: number;
}
