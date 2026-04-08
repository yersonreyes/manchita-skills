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

export class SesionTestDto {
  @ApiProperty() @IsString() id: string;
  @ApiPropertyOptional() @IsOptional() @IsString() usuario?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['exito', 'fallo', 'parcial'])
  resultado?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() feedback?: string;
}

export class PrototipoRapidoDataDto {
  @ApiPropertyOptional() @IsOptional() @IsString() preguntaValidar?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn([
    'sketch',
    'paper-prototype',
    'wizard-of-oz',
    'clickable-mockup',
    'mvp-code',
  ])
  tecnica?: string | null;

  @ApiPropertyOptional() @IsOptional() @IsString() tiempoInvertido?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descripcionPrototipo?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  herramientasUsadas?: string[];

  @ApiPropertyOptional({ type: [SesionTestDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SesionTestDto)
  sesionesTest?: SesionTestDto[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hallazgos?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['iterar', 'pivot', 'avanzar'])
  decision?: string | null;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  iteracionesSiguientes?: string[];
}

export class PrototipoRapidoAnalyzeReqDto {
  @ApiProperty() @IsNumber() @Min(1) toolApplicationId: number;
  @ApiProperty() @IsNumber() @Min(0) currentVersion: number;

  @ApiProperty({ type: PrototipoRapidoDataDto })
  @IsObject()
  @ValidateNested()
  @Type(() => PrototipoRapidoDataDto)
  data: PrototipoRapidoDataDto;
}
