import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class PoemsDataDto {
  @ApiProperty({ example: 'Sucursal bancaria, hora pico del mediodía', required: false })
  @IsString()
  @IsOptional()
  contexto?: string;

  @ApiProperty({ example: 'La fricción principal ocurre en el momento de espera', required: false })
  @IsString()
  @IsOptional()
  sintesis?: string;

  @ApiProperty({ type: [String], example: ['Cajero que atiende de pie durante 8 horas'] })
  @IsArray()
  @IsString({ each: true })
  people: string[];

  @ApiProperty({ type: [String], example: ['Formulario en papel que se llena con lapicera'] })
  @IsArray()
  @IsString({ each: true })
  objects: string[];

  @ApiProperty({ type: [String], example: ['Local ruidoso con música alta'] })
  @IsArray()
  @IsString({ each: true })
  environment: string[];

  @ApiProperty({ type: [String], example: ['Cartel "no se aceptan devoluciones" en letras pequeñas'] })
  @IsArray()
  @IsString({ each: true })
  messages: string[];

  @ApiProperty({ type: [String], example: ['Fila de espera sin señalización de tiempos'] })
  @IsArray()
  @IsString({ each: true })
  services: string[];
}

export class PoemsAnalyzeReqDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  toolApplicationId: number;

  @ApiProperty({ type: PoemsDataDto })
  @ValidateNested()
  @Type(() => PoemsDataDto)
  data: PoemsDataDto;

  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  currentVersion: number;
}
