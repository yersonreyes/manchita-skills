import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class EntrevistaRespuestaDto {
  @ApiProperty() @IsString() id: string;
  @ApiPropertyOptional() @IsOptional() @IsString() pregunta?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() respuesta?: string;
}

export class EntrevistaCualitativaDataDto {
  @ApiPropertyOptional() @IsOptional() @IsString() entrevistado?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() perfil?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() fecha?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() objetivos?: string;
  @ApiProperty({ type: [EntrevistaRespuestaDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EntrevistaRespuestaDto)
  respuestas: EntrevistaRespuestaDto[];
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  citasClave: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() observaciones?: string;
}

export class EntrevistaCualitativaAnalyzeReqDto {
  @ApiProperty() @IsNumber() toolApplicationId: number;
  @ApiProperty({ type: EntrevistaCualitativaDataDto })
  @ValidateNested()
  @Type(() => EntrevistaCualitativaDataDto)
  data: EntrevistaCualitativaDataDto;
  @ApiProperty() @IsNumber() currentVersion: number;
}
