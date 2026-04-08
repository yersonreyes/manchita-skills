import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class PerspectivaSectionDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  insights: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() fuentes?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notas?: string;
}

export class Perspectiva360DataDto {
  @ApiPropertyOptional() @IsOptional() @IsString() objeto?: string;
  @ApiProperty({ type: PerspectivaSectionDto })
  @ValidateNested()
  @Type(() => PerspectivaSectionDto)
  usuario: PerspectivaSectionDto;
  @ApiProperty({ type: PerspectivaSectionDto })
  @ValidateNested()
  @Type(() => PerspectivaSectionDto)
  negocio: PerspectivaSectionDto;
  @ApiProperty({ type: PerspectivaSectionDto })
  @ValidateNested()
  @Type(() => PerspectivaSectionDto)
  tecnologia: PerspectivaSectionDto;
  @ApiProperty({ type: PerspectivaSectionDto })
  @ValidateNested()
  @Type(() => PerspectivaSectionDto)
  competencia: PerspectivaSectionDto;
  @ApiProperty({ type: PerspectivaSectionDto })
  @ValidateNested()
  @Type(() => PerspectivaSectionDto)
  stakeholders: PerspectivaSectionDto;
  @ApiProperty({ type: PerspectivaSectionDto })
  @ValidateNested()
  @Type(() => PerspectivaSectionDto)
  legal: PerspectivaSectionDto;
  @ApiProperty({ type: PerspectivaSectionDto })
  @ValidateNested()
  @Type(() => PerspectivaSectionDto)
  tendencias: PerspectivaSectionDto;
  @ApiPropertyOptional() @IsOptional() @IsString() sintesis?: string;
}

export class Perspectiva360AnalyzeReqDto {
  @ApiProperty() @IsNumber() toolApplicationId: number;
  @ApiProperty({ type: Perspectiva360DataDto })
  @ValidateNested()
  @Type(() => Perspectiva360DataDto)
  data: Perspectiva360DataDto;
  @ApiProperty() @IsNumber() currentVersion: number;
}
