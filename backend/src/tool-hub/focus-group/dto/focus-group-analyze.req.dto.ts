import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class FocusGroupPreguntaDto {
  @ApiProperty() @IsString() id: string;
  @ApiPropertyOptional() @IsOptional() @IsString() fase?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() pregunta?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() respuestasGrupales?: string;
}

export class FocusGroupDataDto {
  @ApiPropertyOptional() @IsOptional() @IsString() objetivo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() perfilParticipantes?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cantidadParticipantes?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() ubicacion?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() fecha?: string;
  @ApiProperty({ type: [FocusGroupPreguntaDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FocusGroupPreguntaDto)
  preguntas: FocusGroupPreguntaDto[];
  @ApiPropertyOptional() @IsOptional() @IsString() dinamicasGrupales?: string;
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  citasClave: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() observaciones?: string;
}

export class FocusGroupAnalyzeReqDto {
  @ApiProperty() @IsNumber() toolApplicationId: number;
  @ApiProperty({ type: FocusGroupDataDto })
  @ValidateNested()
  @Type(() => FocusGroupDataDto)
  data: FocusGroupDataDto;
  @ApiProperty() @IsNumber() currentVersion: number;
}
