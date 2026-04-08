import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import {
  AttachmentType,
  EstadoPago,
  FrecuenciaCosto,
  Moneda,
  TipoRecurso,
} from '@prisma/client';

export class UpdateBudgetDto {
  @ApiProperty({ required: false, example: 15000 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  presupuesto?: number;

  @ApiProperty({ enum: Moneda, required: false })
  @IsEnum(Moneda)
  @IsOptional()
  moneda?: Moneda;
}

export class CreateRecursoDto {
  @ApiProperty({ example: 'Juan — Frontend Dev' })
  @IsString()
  nombre: string;

  @ApiProperty({ enum: TipoRecurso })
  @IsEnum(TipoRecurso)
  tipo: TipoRecurso;

  @ApiProperty({ example: 2500 })
  @IsNumber()
  @Min(0)
  costo: number;

  @ApiProperty({ enum: FrecuenciaCosto })
  @IsEnum(FrecuenciaCosto)
  frecuencia: FrecuenciaCosto;

  @ApiProperty({ required: false, default: 1, example: 3 })
  @IsInt()
  @IsOptional()
  @Min(1)
  cantidad?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notas?: string;

  @ApiProperty({ required: false, example: '2026-01-01T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  fechaInicio?: string;

  @ApiProperty({ required: false, default: 1, example: 3 })
  @IsInt()
  @IsOptional()
  @Min(1)
  duracionMeses?: number;

  @ApiProperty({ required: false, default: false })
  @IsBoolean()
  @IsOptional()
  esRecurrente?: boolean;

  @ApiProperty({ required: false, default: 0, example: 19 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  ivaPorcentaje?: number;

  @ApiProperty({ enum: EstadoPago, required: false, default: 'PENDIENTE' })
  @IsEnum(EstadoPago)
  @IsOptional()
  estadoPago?: EstadoPago;
}

export class UpdateRecursoDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  nombre?: string;

  @ApiProperty({ enum: TipoRecurso, required: false })
  @IsEnum(TipoRecurso)
  @IsOptional()
  tipo?: TipoRecurso;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  costo?: number;

  @ApiProperty({ enum: FrecuenciaCosto, required: false })
  @IsEnum(FrecuenciaCosto)
  @IsOptional()
  frecuencia?: FrecuenciaCosto;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  @Min(1)
  cantidad?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notas?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  fechaInicio?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  @Min(1)
  duracionMeses?: number;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  esRecurrente?: boolean;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  ivaPorcentaje?: number;

  @ApiProperty({ enum: EstadoPago, required: false })
  @IsEnum(EstadoPago)
  @IsOptional()
  estadoPago?: EstadoPago;
}

export class CreateAdjuntoDto {
  @ApiProperty({ example: 'Factura Enero 2026.pdf' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: 'https://s3.amazonaws.com/...' })
  @IsString()
  url: string;

  @ApiProperty({ enum: AttachmentType })
  @IsEnum(AttachmentType)
  tipo: AttachmentType;

  @ApiProperty({ required: false, example: 102400 })
  @IsInt()
  @IsOptional()
  size?: number;
}
