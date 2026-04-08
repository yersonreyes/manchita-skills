import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class TestTareaDataDto {
  @ApiProperty() @IsString() id: string;
  @ApiPropertyOptional() @IsOptional() @IsString() nombre?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() descripcion?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() exito?: number | null;
  @ApiPropertyOptional() @IsOptional() @IsNumber() tiempoSegundos?:
    | number
    | null;
  @ApiPropertyOptional() @IsOptional() @IsNumber() errores?: number | null;
  @ApiPropertyOptional() @IsOptional() @IsNumber() satisfaccion?: number | null;
  @ApiPropertyOptional() @IsOptional() @IsString() notas?: string;
}

export class TestCuantitativoDataDto {
  @ApiPropertyOptional() @IsOptional() @IsString() contexto?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() metodo?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() participantes?:
    | number
    | null;
  @ApiProperty({ type: [TestTareaDataDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestTareaDataDto)
  tareas: TestTareaDataDto[];
  @ApiPropertyOptional() @IsOptional() @IsNumber() sus?: number | null;
  @ApiPropertyOptional() @IsOptional() @IsNumber() nps?: number | null;
  @ApiPropertyOptional() @IsOptional() @IsString() notas?: string;
}

export class TestCuantitativoAnalyzeReqDto {
  @ApiProperty() @IsNumber() @Min(1) toolApplicationId: number;
  @ApiProperty({ type: TestCuantitativoDataDto })
  @ValidateNested()
  @Type(() => TestCuantitativoDataDto)
  data: TestCuantitativoDataDto;
  @ApiProperty() @IsNumber() @Min(0) currentVersion: number;
}
