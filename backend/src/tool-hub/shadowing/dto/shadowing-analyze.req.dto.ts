import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class ObservacionShadowingDto {
  @ApiProperty() @IsString() id: string;
  @ApiPropertyOptional() @IsOptional() @IsString() hora?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() observacion?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() insight?: string;
}

export class SesionShadowingDto {
  @ApiProperty() @IsString() id: string;
  @ApiPropertyOptional() @IsOptional() @IsString() participante?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() tipo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() duracion?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() contexto?: string;
  @ApiProperty({ type: [ObservacionShadowingDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ObservacionShadowingDto)
  observaciones: ObservacionShadowingDto[];
  @ApiPropertyOptional() @IsOptional() @IsString() notas?: string;
}

export class ShadowingDataDto {
  @ApiPropertyOptional() @IsOptional() @IsString() objetivo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() guiaObservacion?: string;
  @ApiProperty({ type: [SesionShadowingDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SesionShadowingDto)
  sesiones: SesionShadowingDto[];
  @ApiPropertyOptional() @IsOptional() @IsString() sintesis?: string;
}

export class ShadowingAnalyzeReqDto {
  @ApiProperty() @IsNumber() toolApplicationId: number;
  @ApiProperty({ type: ShadowingDataDto })
  @ValidateNested()
  @Type(() => ShadowingDataDto)
  data: ShadowingDataDto;
  @ApiProperty() @IsNumber() currentVersion: number;
}
