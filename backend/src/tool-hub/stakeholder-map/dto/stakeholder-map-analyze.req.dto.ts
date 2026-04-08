import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsString,
  Min,
  ValidateNested,
  IsArray,
  IsIn,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

const TIPOS_VALIDOS = [
  'usuario',
  'organizacion',
  'gobierno',
  'proveedor',
  'competidor',
  'regulador',
  'otro',
] as const;

export class StakeholderItemDto {
  @ApiProperty({ example: 'uuid-1234' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'VP de Producto' })
  @IsString()
  nombre: string;

  @ApiProperty({ enum: TIPOS_VALIDOS, example: 'organizacion' })
  @IsIn(TIPOS_VALIDOS)
  tipo: string;

  @ApiProperty({ example: 'Toma decisiones sobre roadmap y presupuesto' })
  @IsString()
  @IsOptional()
  descripcion: string;
}

export class StakeholderCuadrantesDto {
  @ApiProperty({ type: [StakeholderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StakeholderItemDto)
  'manage-closely': StakeholderItemDto[];

  @ApiProperty({ type: [StakeholderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StakeholderItemDto)
  'keep-satisfied': StakeholderItemDto[];

  @ApiProperty({ type: [StakeholderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StakeholderItemDto)
  'keep-informed': StakeholderItemDto[];

  @ApiProperty({ type: [StakeholderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StakeholderItemDto)
  monitor: StakeholderItemDto[];
}

export class StakeholderMapAnalyzeReqDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  toolApplicationId: number;

  @ApiProperty({ type: StakeholderCuadrantesDto })
  @ValidateNested()
  @Type(() => StakeholderCuadrantesDto)
  cuadrantes: StakeholderCuadrantesDto;

  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  currentVersion: number;
}
