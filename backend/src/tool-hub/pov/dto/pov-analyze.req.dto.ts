import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class PovItemDto {
  @ApiProperty() @IsString() id: string;
  @ApiPropertyOptional() @IsOptional() @IsString() usuario?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() necesidad?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() insight?: string;
}

export class PovDataDto {
  @ApiPropertyOptional() @IsOptional() @IsString() contexto?: string;
  @ApiProperty({ type: [PovItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PovItemDto)
  povs: PovItemDto[];
}

export class PovAnalyzeReqDto {
  @ApiProperty() @IsNumber() toolApplicationId: number;
  @ApiProperty({ type: PovDataDto })
  @ValidateNested()
  @Type(() => PovDataDto)
  data: PovDataDto;
  @ApiProperty() @IsNumber() currentVersion: number;
}
