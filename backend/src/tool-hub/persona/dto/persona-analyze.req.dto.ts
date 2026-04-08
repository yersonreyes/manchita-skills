import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PersonaDataDto {
  @ApiProperty({ example: 'María' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: 'La Inversora Cuidadosa', required: false })
  @IsString()
  @IsOptional()
  apodo?: string;

  @ApiProperty({ example: 'primary' })
  @IsString()
  tipo: string;

  @ApiProperty({ example: '32' })
  @IsString()
  @IsOptional()
  edad?: string;

  @ApiProperty({ example: 'Diseñadora UX' })
  @IsString()
  @IsOptional()
  profesion?: string;

  @ApiProperty({ example: 'Ciudad de México' })
  @IsString()
  @IsOptional()
  ubicacion?: string;

  @ApiProperty({ example: '$25,000-35,000 MXN/mes' })
  @IsString()
  @IsOptional()
  ingresos?: string;

  @ApiProperty({ example: 'María trabaja como diseñadora UX...' })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({ type: [String], example: ['Sentir que sus ahorros trabajan'] })
  @IsArray()
  @IsString({ each: true })
  motivaciones: string[];

  @ApiProperty({ type: [String], example: ['Todo parece muy complicado'] })
  @IsArray()
  @IsString({ each: true })
  frustraciones: string[];

  @ApiProperty({ example: 'Heavy user de Instagram y TikTok' })
  @IsString()
  @IsOptional()
  comportamiento?: string;

  @ApiProperty({
    example: 'Necesito algo que me explique en palabras simples.',
  })
  @IsString()
  @IsOptional()
  cita?: string;
}

export class PersonaAnalyzeReqDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  toolApplicationId: number;

  @ApiProperty({ type: PersonaDataDto })
  @ValidateNested()
  @Type(() => PersonaDataDto)
  data: PersonaDataDto;

  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  currentVersion: number;
}
