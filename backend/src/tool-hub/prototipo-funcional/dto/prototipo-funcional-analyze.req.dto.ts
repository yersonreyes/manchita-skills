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

export class FlujoCriticoDto {
  @ApiProperty() @IsString() id: string;
  @ApiPropertyOptional() @IsOptional() @IsString() nombre?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() descripcion?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['pendiente', 'funcionando', 'con-bugs'])
  estado?: string;
}

export class FeatureDto {
  @ApiProperty() @IsString() id: string;
  @ApiPropertyOptional() @IsOptional() @IsString() nombre?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['alta', 'media', 'baja'])
  prioridad?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() incluida?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() notas?: string;
}

export class HallazgoDto {
  @ApiProperty() @IsString() id: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['funcional', 'ux', 'performance'])
  tipo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() descripcion?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() resuelto?: boolean;
}

export class PrototipoFuncionalDataDto {
  @ApiPropertyOptional() @IsOptional() @IsString() objetivo?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['mvp', 'pilot', 'beta', 'feature-flag', ''])
  tipo?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  herramientas?: string[];

  @ApiPropertyOptional({ type: [FlujoCriticoDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlujoCriticoDto)
  flujosCriticos?: FlujoCriticoDto[];

  @ApiPropertyOptional({ type: [FeatureDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeatureDto)
  features?: FeatureDto[];

  @ApiPropertyOptional({ type: [HallazgoDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HallazgoDto)
  hallazgos?: HallazgoDto[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  proximosPasos?: string[];
}

export class PrototipoFuncionalAnalyzeReqDto {
  @ApiProperty() @IsNumber() @Min(1) toolApplicationId: number;
  @ApiProperty() @IsNumber() @Min(0) currentVersion: number;

  @ApiProperty({ type: PrototipoFuncionalDataDto })
  @IsObject()
  @ValidateNested()
  @Type(() => PrototipoFuncionalDataDto)
  data: PrototipoFuncionalDataDto;
}
