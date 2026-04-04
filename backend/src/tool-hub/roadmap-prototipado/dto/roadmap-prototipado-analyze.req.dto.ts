import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class PrototipoDto {
  @ApiProperty() @IsString() id: string;
  @ApiPropertyOptional() @IsOptional() @IsString() nombre?: string;
  @ApiPropertyOptional() @IsOptional() @IsIn(['low', 'low-mid', 'mid', 'mid-hi', 'high']) fidelidad?: string;
  @ApiPropertyOptional() @IsOptional() @IsIn(['explorar', 'validar', 'comunicar', 'refinar']) proposito?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() herramienta?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() entregable?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() completado?: boolean;
}

export class FaseDto {
  @ApiProperty() @IsString() id: string;
  @ApiPropertyOptional() @IsOptional() @IsString() nombre?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() semanas?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() objetivo?: string;

  @ApiPropertyOptional({ type: [PrototipoDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrototipoDto)
  prototipos?: PrototipoDto[];
}

export class FeaturePrioridadDto {
  @ApiProperty() @IsString() id: string;
  @ApiPropertyOptional() @IsOptional() @IsString() nombre?: string;
  @ApiPropertyOptional() @IsOptional() @IsIn(['alta', 'media', 'baja']) prioridad?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() fase?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() razon?: string;
}

export class RoadmapPrototipadoDataDto {
  @ApiPropertyOptional() @IsOptional() @IsString() contexto?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() equipo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() duracionTotal?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  restricciones?: string[];

  @ApiPropertyOptional({ type: [FaseDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FaseDto)
  fases?: FaseDto[];

  @ApiPropertyOptional({ type: [FeaturePrioridadDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeaturePrioridadDto)
  features?: FeaturePrioridadDto[];
}

export class RoadmapPrototipadoAnalyzeReqDto {
  @ApiProperty() @IsNumber() @Min(1) toolApplicationId: number;
  @ApiProperty() @IsNumber() @Min(0) currentVersion: number;

  @ApiProperty({ type: RoadmapPrototipadoDataDto })
  @IsObject()
  @ValidateNested()
  @Type(() => RoadmapPrototipadoDataDto)
  data: RoadmapPrototipadoDataDto;
}
