import { IsArray, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AnalogoItemDto {
  @ApiProperty({ example: 'Aviación' })
  @IsString()
  industria: string;

  @ApiProperty({ example: 'Sistema de slots de aterrizaje' })
  @IsString()
  solucion: string;

  @ApiProperty({ example: 'Citas de entrega programadas', required: false })
  @IsString()
  @IsOptional()
  adaptacion?: string;
}

export class AntilogoItemDto {
  @ApiProperty({ example: 'Retail' })
  @IsString()
  industria: string;

  @ApiProperty({ example: 'Descuentos insostenibles que erosionaron márgenes' })
  @IsString()
  fracaso: string;

  @ApiProperty({ example: 'No depender exclusivamente del precio', required: false })
  @IsString()
  @IsOptional()
  errorAEvitar?: string;
}

export class AnalogosAntilogosItemsDto {
  @ApiProperty({ type: [AnalogoItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnalogoItemDto)
  analogos: AnalogoItemDto[];

  @ApiProperty({ type: [AntilogoItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AntilogoItemDto)
  antilogos: AntilogoItemDto[];
}

export class AnalogosAntilogosAnalyzeReqDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  toolApplicationId: number;

  @ApiProperty({ type: AnalogosAntilogosItemsDto })
  @ValidateNested()
  @Type(() => AnalogosAntilogosItemsDto)
  items: AnalogosAntilogosItemsDto;

  @ApiProperty({ example: 0, description: 'Cantidad de informes ya existentes (para calcular versión)' })
  @IsInt()
  @Min(0)
  currentVersion: number;
}
