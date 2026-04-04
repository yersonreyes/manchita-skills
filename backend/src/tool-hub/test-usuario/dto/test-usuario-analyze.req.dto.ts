import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class TareaObservadaDataDto {
  @ApiProperty() @IsString() id: string;
  @ApiPropertyOptional() @IsOptional() @IsString() nombre?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() exito?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsNumber() tiempoSegundos?: number | null;
  @ApiPropertyOptional() @IsOptional() @IsString() observaciones?: string;
}

export class SesionTestDataDto {
  @ApiProperty() @IsString() id: string;
  @ApiPropertyOptional() @IsOptional() @IsString() participante?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() perfil?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() fecha?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() tipo?: string;
  @ApiProperty({ type: [TareaObservadaDataDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => TareaObservadaDataDto) tareas: TareaObservadaDataDto[];
  @ApiPropertyOptional() @IsOptional() @IsString() hallazgos?: string;
  @ApiProperty({ type: [String] }) @IsArray() @IsString({ each: true }) citas: string[];
}

export class TestUsuarioDataDto {
  @ApiPropertyOptional() @IsOptional() @IsString() objetivos?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() prototipo?: string;
  @ApiProperty({ type: [SesionTestDataDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => SesionTestDataDto) sesiones: SesionTestDataDto[];
  @ApiPropertyOptional() @IsOptional() @IsString() notas?: string;
}

export class TestUsuarioAnalyzeReqDto {
  @ApiProperty() @IsNumber() @Min(1) toolApplicationId: number;
  @ApiProperty({ type: TestUsuarioDataDto }) @ValidateNested() @Type(() => TestUsuarioDataDto) data: TestUsuarioDataDto;
  @ApiProperty() @IsNumber() @Min(0) currentVersion: number;
}
