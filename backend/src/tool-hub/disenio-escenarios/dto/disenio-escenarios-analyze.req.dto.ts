import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsIn, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class PasoFlujoDto {
  @ApiProperty() @IsString() id: string;
  @ApiPropertyOptional() @IsOptional() @IsString() accion?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() reaccionSistema?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() emocion?: string;
}

export class EscenarioDto {
  @ApiProperty() @IsString() id: string;
  @ApiPropertyOptional() @IsOptional() @IsString() nombre?: string;
  @ApiPropertyOptional() @IsOptional() @IsIn(['happy-path', 'edge-case', 'error', 'contextual', 'day-in-life', '']) tipo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() usuario?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() donde?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() cuando?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() objetivo?: string;
  @ApiProperty({ type: [PasoFlujoDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => PasoFlujoDto) pasos: PasoFlujoDto[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) oportunidades?: string[];
}

export class DisenioEscenariosDataDto {
  @ApiPropertyOptional() @IsOptional() @IsString() contextoGeneral?: string;
  @ApiProperty({ type: [EscenarioDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => EscenarioDto) escenarios: EscenarioDto[];
}

export class DisenioEscenariosAnalyzeReqDto {
  @ApiProperty() @IsNumber() toolApplicationId: number;
  @ApiProperty({ type: DisenioEscenariosDataDto }) @ValidateNested() @Type(() => DisenioEscenariosDataDto) data: DisenioEscenariosDataDto;
  @ApiProperty() @IsNumber() currentVersion: number;
}
