import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class BriefDataDto {
  @ApiPropertyOptional() @IsOptional() @IsString() contexto?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() objetivoPrincipal?: string;
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  objetivosSecundarios: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() usuarioTarget?: string;
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  inScope: string[];
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  outScope: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() timeline?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() budget?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() restriccionesTech?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() otrasRestricciones?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() decisionMaker?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() contacto?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() equipo?: string;
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  entregables: string[];
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  metricasExito: string[];
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  riesgos: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() timelineMilestones?: string;
}

export class BriefAnalyzeReqDto {
  @ApiProperty() @IsNumber() toolApplicationId: number;
  @ApiProperty({ type: BriefDataDto })
  @ValidateNested()
  @Type(() => BriefDataDto)
  data: BriefDataDto;
  @ApiProperty() @IsNumber() currentVersion: number;
}
