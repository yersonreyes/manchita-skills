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

export class MapaEmpatiaDataDto {
  @ApiProperty({ example: 'María, freelancer de diseño', required: false })
  @IsString()
  @IsOptional()
  usuario?: string;

  @ApiProperty({ example: 'Fin de mes, gestionando proyectos simultáneos', required: false })
  @IsString()
  @IsOptional()
  contexto?: string;

  @ApiProperty({ type: [String], example: ['Ve que sus amigos usan apps de inversión'] })
  @IsArray()
  @IsString({ each: true })
  ve: string[];

  @ApiProperty({ type: [String], example: ['Escucha que "invertir es muy complicado"'] })
  @IsArray()
  @IsString({ each: true })
  oye: string[];

  @ApiProperty({ type: [String], example: ['Piensa que no tiene suficiente dinero para invertir'] })
  @IsArray()
  @IsString({ each: true })
  piensa: string[];

  @ApiProperty({ type: [String], example: ['Siente frustración cuando ve sus ahorros estancados'] })
  @IsArray()
  @IsString({ each: true })
  siente: string[];

  @ApiProperty({ type: [String], example: ['Dice "yo no entiendo de finanzas"'] })
  @IsArray()
  @IsString({ each: true })
  dice: string[];

  @ApiProperty({ type: [String], example: ['Abre la app del banco 3+ veces al día pero no invierte'] })
  @IsArray()
  @IsString({ each: true })
  hace: string[];
}

export class MapaEmpatiaAnalyzeReqDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  toolApplicationId: number;

  @ApiProperty({ type: MapaEmpatiaDataDto })
  @ValidateNested()
  @Type(() => MapaEmpatiaDataDto)
  data: MapaEmpatiaDataDto;

  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  currentVersion: number;
}
