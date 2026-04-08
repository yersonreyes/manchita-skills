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

export class PreguntaAnticipadaDto {
  @ApiProperty() @IsString() id: string;
  @ApiPropertyOptional() @IsOptional() @IsString() pregunta?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() respuesta?: string;
}

export class PrototipoMostrarDataDto {
  @ApiPropertyOptional() @IsOptional() @IsString() audiencia?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['estatico', 'interactivo', 'video', 'mvp'])
  nivelDemo?: string | null;

  @ApiPropertyOptional() @IsOptional() @IsString() mensajeClave?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() problemaQueResuelve?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  beneficiosDestacados?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  herramientasUsadas?: string[];

  @ApiPropertyOptional({ type: [PreguntaAnticipadaDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PreguntaAnticipadaDto)
  preguntasAnticipadas?: PreguntaAnticipadaDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resultadosPresentacion?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  feedbackRecibido?: string[];
}

export class PrototipoMostrarAnalyzeReqDto {
  @ApiProperty() @IsNumber() @Min(1) toolApplicationId: number;
  @ApiProperty() @IsNumber() @Min(0) currentVersion: number;

  @ApiProperty({ type: PrototipoMostrarDataDto })
  @IsObject()
  @ValidateNested()
  @Type(() => PrototipoMostrarDataDto)
  data: PrototipoMostrarDataDto;
}
