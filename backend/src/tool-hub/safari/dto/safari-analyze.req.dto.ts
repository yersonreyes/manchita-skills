import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class ObservacionDto {
  @ApiProperty() @IsString() id: string;
  @ApiPropertyOptional() @IsOptional() @IsString() momento?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() observacion?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() insight?: string;
}

export class SesionSafariDto {
  @ApiProperty() @IsString() id: string;
  @ApiPropertyOptional() @IsOptional() @IsString() ubicacion?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() duracion?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() equipo?: string;
  @ApiProperty({ type: [ObservacionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ObservacionDto)
  observaciones: ObservacionDto[];
  @ApiPropertyOptional() @IsOptional() @IsString() notas?: string;
}

export class SafariDataDto {
  @ApiPropertyOptional() @IsOptional() @IsString() objetivo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() guiaObservacion?: string;
  @ApiProperty({ type: [SesionSafariDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SesionSafariDto)
  sesiones: SesionSafariDto[];
  @ApiPropertyOptional() @IsOptional() @IsString() sintesis?: string;
}

export class SafariAnalyzeReqDto {
  @ApiProperty() @IsNumber() toolApplicationId: number;
  @ApiProperty({ type: SafariDataDto })
  @ValidateNested()
  @Type(() => SafariDataDto)
  data: SafariDataDto;
  @ApiProperty() @IsNumber() currentVersion: number;
}
