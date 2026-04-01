import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class BusquedaMediosHallazgoDto {
  @ApiProperty() @IsString() id: string;
  @ApiProperty() @IsString() tipo: string;
  @ApiProperty() @IsString() titulo: string;
  @ApiPropertyOptional() @IsOptional() @IsString() fuente?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() insight?: string;
}

export class BusquedaMediosDataDto {
  @ApiPropertyOptional() @IsOptional() @IsString() tema?: string;
  @ApiProperty({ type: [String] }) @IsArray() @IsString({ each: true }) queries: string[];
  @ApiProperty({ type: [BusquedaMediosHallazgoDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => BusquedaMediosHallazgoDto) hallazgos: BusquedaMediosHallazgoDto[];
  @ApiProperty({ type: [String] }) @IsArray() @IsString({ each: true }) tendencias: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() sentiment?: string;
  @ApiProperty({ type: [String] }) @IsArray() @IsString({ each: true }) narrativas: string[];
  @ApiProperty({ type: [String] }) @IsArray() @IsString({ each: true }) gaps: string[];
}

export class BusquedaMediosAnalyzeReqDto {
  @ApiProperty() @IsNumber() toolApplicationId: number;
  @ApiProperty({ type: BusquedaMediosDataDto }) @ValidateNested() @Type(() => BusquedaMediosDataDto) data: BusquedaMediosDataDto;
  @ApiProperty() @IsNumber() currentVersion: number;
}
