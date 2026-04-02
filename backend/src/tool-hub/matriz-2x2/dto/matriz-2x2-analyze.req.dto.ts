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

export enum ValorEjeEnum {
  ALTO = 'alto',
  BAJO = 'bajo',
}

export class Matriz2x2ConfigDto {
  @ApiProperty({ example: 'Esfuerzo', required: false })
  @IsString()
  @IsOptional()
  ejeXNombre?: string;

  @ApiProperty({ example: 'Impacto', required: false })
  @IsString()
  @IsOptional()
  ejeYNombre?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  cuadrante_AX_AY?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  cuadrante_BX_AY?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  cuadrante_AX_BY?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  cuadrante_BX_BY?: string;
}

export class Matriz2x2ItemDto {
  @ApiProperty({ example: 'abc-123' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'Notificaciones push' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: 'Ayuda a retener usuarios', required: false })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ enum: ValorEjeEnum, example: 'alto' })
  @IsEnum(ValorEjeEnum)
  ejeX: ValorEjeEnum;

  @ApiProperty({ enum: ValorEjeEnum, example: 'alto' })
  @IsEnum(ValorEjeEnum)
  ejeY: ValorEjeEnum;
}

export class Matriz2x2DataDto {
  @ApiProperty({ example: 'Priorización del backlog Q3 2025', required: false })
  @IsString()
  @IsOptional()
  contexto?: string;

  @ApiProperty({ type: Matriz2x2ConfigDto })
  @ValidateNested()
  @Type(() => Matriz2x2ConfigDto)
  config: Matriz2x2ConfigDto;

  @ApiProperty({ type: [Matriz2x2ItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Matriz2x2ItemDto)
  items: Matriz2x2ItemDto[];
}

export class Matriz2x2AnalyzeReqDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  toolApplicationId: number;

  @ApiProperty({ type: Matriz2x2DataDto })
  @ValidateNested()
  @Type(() => Matriz2x2DataDto)
  data: Matriz2x2DataDto;

  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  currentVersion: number;
}
