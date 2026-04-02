import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class MetaforaItemDto {
  @ApiProperty() @IsString() id: string;
  @ApiPropertyOptional() @IsOptional() @IsString() titulo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() descripcion?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() tipo?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) insights?: string[];
}

export class MetaforaProblemaDataDto {
  @ApiPropertyOptional() @IsOptional() @IsString() problemaOriginal?: string;
  @ApiProperty({ type: [MetaforaItemDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => MetaforaItemDto) metaforas: MetaforaItemDto[];
  @ApiPropertyOptional() @IsOptional() @IsString() metaforaSeleccionada?: string;
}

export class MetaforaProblemaAnalyzeReqDto {
  @ApiProperty() @IsNumber() toolApplicationId: number;
  @ApiProperty({ type: MetaforaProblemaDataDto }) @ValidateNested() @Type(() => MetaforaProblemaDataDto) data: MetaforaProblemaDataDto;
  @ApiProperty() @IsNumber() currentVersion: number;
}
