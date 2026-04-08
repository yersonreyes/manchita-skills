import {
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DiagnosticoInputsDto {
  @ApiPropertyOptional({
    example: 'Hay 3 jugadores dominantes con precios agresivos.',
  })
  @IsOptional()
  @IsString()
  rivalidad?: string;

  @ApiPropertyOptional({
    example: 'Las barreras regulatorias son altas, capital inicial elevado.',
  })
  @IsOptional()
  @IsString()
  nuevosEntrantes?: string;

  @ApiPropertyOptional({
    example: 'Pocos proveedores especializados con precios fijos.',
  })
  @IsOptional()
  @IsString()
  proveedores?: string;

  @ApiPropertyOptional({
    example: 'Grandes corporaciones que negocian contratos anuales.',
  })
  @IsOptional()
  @IsString()
  clientes?: string;

  @ApiPropertyOptional({
    example: 'Soluciones manuales o planillas de cálculo como alternativa.',
  })
  @IsOptional()
  @IsString()
  sustitutos?: string;

  @ApiPropertyOptional({
    example: 'Crecimiento del sector tech, regulación de datos en expansión.',
  })
  @IsOptional()
  @IsString()
  tendencias?: string;
}

export class DiagnosticoIndustriaReqDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  toolApplicationId: number;

  @ApiProperty({ type: DiagnosticoInputsDto })
  @ValidateNested()
  @Type(() => DiagnosticoInputsDto)
  inputs: DiagnosticoInputsDto;

  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  currentVersion: number;
}
