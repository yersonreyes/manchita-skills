import { IsArray, IsInt, IsObject, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class FodaItemsDto {
  @ApiProperty({ example: ['Equipo experimentado', 'Marca reconocida'] })
  @IsArray()
  @IsString({ each: true })
  fortalezas: string[];

  @ApiProperty({ example: ['Mercado en crecimiento', 'Nueva regulación favorable'] })
  @IsArray()
  @IsString({ each: true })
  oportunidades: string[];

  @ApiProperty({ example: ['Falta de financiamiento', 'Equipo reducido'] })
  @IsArray()
  @IsString({ each: true })
  debilidades: string[];

  @ApiProperty({ example: ['Competencia agresiva', 'Inestabilidad económica'] })
  @IsArray()
  @IsString({ each: true })
  amenazas: string[];
}

export class FodaAnalyzeReqDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  toolApplicationId: number;

  @ApiProperty({ type: FodaItemsDto })
  @IsObject()
  @ValidateNested()
  @Type(() => FodaItemsDto)
  items: FodaItemsDto;

  @ApiProperty({ example: 0, description: 'Cantidad de informes ya existentes (para calcular versión)' })
  @IsInt()
  @Min(0)
  currentVersion: number;
}
