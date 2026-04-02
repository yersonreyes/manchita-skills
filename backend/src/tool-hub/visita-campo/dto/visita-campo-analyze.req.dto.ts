import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class HallazgoVisitaDto {
  @ApiProperty() @IsString() id: string;
  @ApiPropertyOptional() @IsOptional() @IsString() tipo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() observacion?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() insight?: string;
}

export class VisitaDto {
  @ApiProperty() @IsString() id: string;
  @ApiPropertyOptional() @IsOptional() @IsString() lugar?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() fecha?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() duracion?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() equipo?: string;
  @ApiProperty({ type: [HallazgoVisitaDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => HallazgoVisitaDto) hallazgos: HallazgoVisitaDto[];
  @ApiPropertyOptional() @IsOptional() @IsString() notas?: string;
}

export class VisitaCampoDataDto {
  @ApiPropertyOptional() @IsOptional() @IsString() objetivo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() guiaVisita?: string;
  @ApiProperty({ type: [VisitaDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => VisitaDto) visitas: VisitaDto[];
  @ApiPropertyOptional() @IsOptional() @IsString() sintesis?: string;
}

export class VisitaCampoAnalyzeReqDto {
  @ApiProperty() @IsNumber() toolApplicationId: number;
  @ApiProperty({ type: VisitaCampoDataDto }) @ValidateNested() @Type(() => VisitaCampoDataDto) data: VisitaCampoDataDto;
  @ApiProperty() @IsNumber() currentVersion: number;
}
