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

export class FeatureMvpDto {
  @ApiProperty() @IsString() id: string;
  @ApiPropertyOptional() @IsOptional() @IsString() nombre?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['alto', 'bajo'])
  valorUsuario?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['alto', 'bajo'])
  esfuerzo?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() incluida?: boolean;
}

export class AprendizajeDto {
  @ApiProperty() @IsString() id: string;
  @ApiPropertyOptional() @IsOptional() @IsString() hipotesis?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() metrica?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() resultado?: string;
  @ApiPropertyOptional() @IsOptional() validada?: boolean | null;
}

export class MvpDataDto {
  @ApiPropertyOptional() @IsOptional() @IsString() hipotesisPrincipal?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn([
    'wizard-of-oz',
    'concierge',
    'landing-email',
    'crowdfunding',
    'feature-mvp',
    '',
  ])
  tipo?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() coreFeature?: string;

  @ApiPropertyOptional({ type: [FeatureMvpDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeatureMvpDto)
  features?: FeatureMvpDto[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  criteriosLanzamiento?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metricas?: string[];

  @ApiPropertyOptional({ type: [AprendizajeDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AprendizajeDto)
  aprendizajes?: AprendizajeDto[];
}

export class MvpAnalyzeReqDto {
  @ApiProperty() @IsNumber() @Min(1) toolApplicationId: number;
  @ApiProperty() @IsNumber() @Min(0) currentVersion: number;

  @ApiProperty({ type: MvpDataDto })
  @IsObject()
  @ValidateNested()
  @Type(() => MvpDataDto)
  data: MvpDataDto;
}
