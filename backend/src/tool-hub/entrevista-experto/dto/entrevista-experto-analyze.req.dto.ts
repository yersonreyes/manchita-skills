import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class EntrevistaExpertoRespuestaDto {
  @ApiProperty() @IsString() id: string;
  @ApiPropertyOptional() @IsOptional() @IsString() pregunta?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() respuesta?: string;
}

export class EntrevistaExpertoDataDto {
  @ApiPropertyOptional() @IsOptional() @IsString() experto?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() experticia?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() organizacion?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() cargo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() fecha?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() objetivos?: string;
  @ApiProperty({ type: [EntrevistaExpertoRespuestaDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EntrevistaExpertoRespuestaDto)
  respuestas: EntrevistaExpertoRespuestaDto[];
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  citasTecnicas: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() observaciones?: string;
}

export class EntrevistaExpertoAnalyzeReqDto {
  @ApiProperty() @IsNumber() toolApplicationId: number;
  @ApiProperty({ type: EntrevistaExpertoDataDto })
  @ValidateNested()
  @Type(() => EntrevistaExpertoDataDto)
  data: EntrevistaExpertoDataDto;
  @ApiProperty() @IsNumber() currentVersion: number;
}
