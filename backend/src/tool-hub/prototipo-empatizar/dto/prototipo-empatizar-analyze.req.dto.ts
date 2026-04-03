import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class PasoSesionDto {
  @ApiProperty() @IsString() id: string;
  @ApiProperty() @IsString() descripcion: string;
  @ApiPropertyOptional() @IsOptional() @IsString() observacion?: string;
}

export class PrototipoEmpatizarDataDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['role-play', 'bodystorming', 'environmental', 'experiencial'])
  tipoPrototipo?: string | null;

  @ApiPropertyOptional() @IsOptional() @IsString() objetivo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() contexto?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  participantes?: string[];

  @ApiPropertyOptional({ type: [PasoSesionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PasoSesionDto)
  pasos?: PasoSesionDto[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  insightsEmocionales?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  friccionesIdentificadas?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  supuestosValidados?: string[];

  @ApiPropertyOptional() @IsOptional() @IsString() notas?: string;
}

export class PrototipoEmpatizarAnalyzeReqDto {
  @ApiProperty() @IsNumber() @Min(1) toolApplicationId: number;
  @ApiProperty() @IsNumber() @Min(0) currentVersion: number;

  @ApiProperty({ type: PrototipoEmpatizarDataDto })
  @IsObject()
  @ValidateNested()
  @Type(() => PrototipoEmpatizarDataDto)
  data: PrototipoEmpatizarDataDto;
}
