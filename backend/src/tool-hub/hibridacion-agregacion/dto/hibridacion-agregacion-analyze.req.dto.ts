import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsIn, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class IdeaBaseDto {
  @ApiProperty() @IsString() id: string;
  @ApiPropertyOptional() @IsOptional() @IsString() nombre?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() descripcion?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) elementos?: string[];
}

export class CombinacionDto {
  @ApiProperty() @IsString() id: string;
  @ApiPropertyOptional() @IsOptional() @IsString() elementoA?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() elementoB?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() resultado?: string;
}

export class HibridacionAgregacionDataDto {
  @ApiPropertyOptional() @IsOptional() @IsString() contexto?: string;
  @ApiPropertyOptional() @IsOptional() @IsIn(['feature-stacking', 'best-of-each', 'plus-minus', 'mashup', '']) tecnica?: string;
  @ApiProperty({ type: [IdeaBaseDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => IdeaBaseDto) ideasBase: IdeaBaseDto[];
  @ApiPropertyOptional({ type: [CombinacionDto] }) @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => CombinacionDto) combinaciones?: CombinacionDto[];
  @ApiPropertyOptional() @IsOptional() @IsString() ideaHibrida?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() propuestaValor?: string;
}

export class HibridacionAgregacionAnalyzeReqDto {
  @ApiProperty() @IsNumber() toolApplicationId: number;
  @ApiProperty({ type: HibridacionAgregacionDataDto }) @ValidateNested() @Type(() => HibridacionAgregacionDataDto) data: HibridacionAgregacionDataDto;
  @ApiProperty() @IsNumber() currentVersion: number;
}
