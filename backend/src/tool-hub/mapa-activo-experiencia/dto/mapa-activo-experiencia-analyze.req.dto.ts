import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class EtapaActivaDto {
  @ApiProperty() @IsString() id: string;
  @ApiPropertyOptional() @IsOptional() @IsString() nombre?: string;
  @ApiProperty({ type: [String] }) @IsArray() @IsString({ each: true }) acciones: string[];
  @ApiProperty({ type: [String] }) @IsArray() @IsString({ each: true }) touchpoints: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() momentoClave?: string;
  @ApiProperty({ type: [String] }) @IsArray() @IsString({ each: true }) oportunidades: string[];
}

export class MapaActivoExperienciaDataDto {
  @ApiPropertyOptional() @IsOptional() @IsString() contexto?: string;
  @ApiProperty({ type: [EtapaActivaDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => EtapaActivaDto) etapas: EtapaActivaDto[];
}

export class MapaActivoExperienciaAnalyzeReqDto {
  @ApiProperty() @IsNumber() toolApplicationId: number;
  @ApiProperty({ type: MapaActivoExperienciaDataDto }) @ValidateNested() @Type(() => MapaActivoExperienciaDataDto) data: MapaActivoExperienciaDataDto;
  @ApiProperty() @IsNumber() currentVersion: number;
}
