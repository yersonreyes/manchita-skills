import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class BuzzReportMencionDto {
  @ApiProperty() @IsString() id: string;
  @ApiProperty() @IsString() canal: string;
  @ApiProperty() @IsString() sentiment: string;
  @ApiPropertyOptional() @IsOptional() @IsString() autor?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() contenido?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() alcance?: string;
}

export class BuzzReportDataDto {
  @ApiPropertyOptional() @IsOptional() @IsString() marca?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() periodo?: string;
  @ApiProperty({ type: [BuzzReportMencionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BuzzReportMencionDto)
  menciones: BuzzReportMencionDto[];
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  temasRecurrentes: string[];
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  vocesInfluyentes: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() sentimentOverall?: string;
}

export class BuzzReportAnalyzeReqDto {
  @ApiProperty() @IsNumber() toolApplicationId: number;
  @ApiProperty({ type: BuzzReportDataDto })
  @ValidateNested()
  @Type(() => BuzzReportDataDto)
  data: BuzzReportDataDto;
  @ApiProperty() @IsNumber() currentVersion: number;
}
