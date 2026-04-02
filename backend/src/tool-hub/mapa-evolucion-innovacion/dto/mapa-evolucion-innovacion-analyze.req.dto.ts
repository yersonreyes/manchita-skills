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

export enum TipoInnovacionEnum {
  INCREMENTAL = 'incremental',
  DISRUPTIVA = 'disruptiva',
  ARQUITECTURAL = 'arquitectural',
  RADICAL = 'radical',
}

export class HitoDto {
  @ApiProperty({ example: 'abc-123' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'Llegada del smartphone' })
  @IsString()
  descripcion: string;

  @ApiProperty({ enum: TipoInnovacionEnum, example: 'disruptiva' })
  @IsEnum(TipoInnovacionEnum)
  tipoInnovacion: TipoInnovacionEnum;
}

export class EraEvolucionDto {
  @ApiProperty({ example: 'era-123' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'Era Digital' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: '2000 - 2015', required: false })
  @IsString()
  @IsOptional()
  periodo?: string;

  @ApiProperty({ type: [HitoDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HitoDto)
  hitos: HitoDto[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  puntosInflexion: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  oportunidades: string[];
}

export class MapaEvolucionInnovacionDataDto {
  @ApiProperty({ example: 'Transporte urbano', required: false })
  @IsString()
  @IsOptional()
  industria?: string;

  @ApiProperty({ example: 'Evolución del transporte urbano desde 1980', required: false })
  @IsString()
  @IsOptional()
  contexto?: string;

  @ApiProperty({ type: [EraEvolucionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EraEvolucionDto)
  eras: EraEvolucionDto[];
}

export class MapaEvolucionInnovacionAnalyzeReqDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  toolApplicationId: number;

  @ApiProperty({ type: MapaEvolucionInnovacionDataDto })
  @ValidateNested()
  @Type(() => MapaEvolucionInnovacionDataDto)
  data: MapaEvolucionInnovacionDataDto;

  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  currentVersion: number;
}
