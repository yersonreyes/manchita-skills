import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class DesafioItemDto {
  @ApiProperty() @IsString() id: string;
  @ApiPropertyOptional() @IsOptional() @IsString() accion?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() usuario?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() contexto?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() resultado?: string;
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  constraints: string[];
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  criteriosExito: string[];
}

export class DesafioDisenoDataDto {
  @ApiPropertyOptional() @IsOptional() @IsString() contexto?: string;
  @ApiProperty({ type: [DesafioItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DesafioItemDto)
  desafios: DesafioItemDto[];
}

export class DesafioDisenoAnalyzeReqDto {
  @ApiProperty() @IsNumber() toolApplicationId: number;
  @ApiProperty({ type: DesafioDisenoDataDto })
  @ValidateNested()
  @Type(() => DesafioDisenoDataDto)
  data: DesafioDisenoDataDto;
  @ApiProperty() @IsNumber() currentVersion: number;
}
