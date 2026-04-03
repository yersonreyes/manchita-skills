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

export class IteracionDto {
  @ApiProperty() @IsString() id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['sketch', 'wireframe', 'storyboard', 'paper-prototype'])
  tipo?: string | null;

  @ApiPropertyOptional() @IsOptional() @IsString() descripcion?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() herramienta?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() duracion?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  aprendizajes?: string[];

  @ApiPropertyOptional() @IsOptional() @IsBoolean() descartada?: boolean;
}

export class PrototipoPensarDataDto {
  @ApiPropertyOptional() @IsOptional() @IsString() preguntaExplorar?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() contexto?: string;

  @ApiPropertyOptional({ type: [IteracionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IteracionDto)
  iteraciones?: IteracionDto[];

  @ApiPropertyOptional() @IsOptional() @IsString() decisionFinal?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  proximosPasos?: string[];
}

export class PrototipoPensarAnalyzeReqDto {
  @ApiProperty() @IsNumber() @Min(1) toolApplicationId: number;
  @ApiProperty() @IsNumber() @Min(0) currentVersion: number;

  @ApiProperty({ type: PrototipoPensarDataDto })
  @IsObject()
  @ValidateNested()
  @Type(() => PrototipoPensarDataDto)
  data: PrototipoPensarDataDto;
}
