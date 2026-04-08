import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export enum IdeaEstadoEnum {
  ACTIVA = 'activa',
  SELECCIONADA = 'seleccionada',
  DESCARTADA = 'descartada',
}

export class IdeaConvergenciaDto {
  @ApiProperty() @IsString() id: string;
  @ApiPropertyOptional() @IsOptional() @IsString() texto?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() cluster?: string;
  @ApiProperty({ enum: IdeaEstadoEnum })
  @IsEnum(IdeaEstadoEnum)
  estado: IdeaEstadoEnum;
  @ApiPropertyOptional() @IsOptional() @IsString() razonDescarte?: string;
}

export class MapaConvergenciaDataDto {
  @ApiPropertyOptional() @IsOptional() @IsString() contexto?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  criterios?: string[];
  @ApiProperty({ type: [IdeaConvergenciaDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IdeaConvergenciaDto)
  ideas: IdeaConvergenciaDto[];
  @ApiPropertyOptional() @IsOptional() @IsString() notas?: string;
}

export class MapaConvergenciaAnalyzeReqDto {
  @ApiProperty() @IsNumber() toolApplicationId: number;
  @ApiProperty({ type: MapaConvergenciaDataDto })
  @ValidateNested()
  @Type(() => MapaConvergenciaDataDto)
  data: MapaConvergenciaDataDto;
  @ApiProperty() @IsNumber() currentVersion: number;
}
