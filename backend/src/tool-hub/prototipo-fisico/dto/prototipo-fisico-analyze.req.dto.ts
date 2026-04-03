import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class IteracionFisicaDto {
  @ApiProperty() @IsString() id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['carton', 'foam', 'madera-balsa', 'impresion-3d', 'resina', 'otro'])
  material?: string | null;

  @ApiPropertyOptional() @IsOptional() @IsString() materialOtro?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['mockup-papel', 'modelo-funcional', 'prototipo-usuario', 'produccion'])
  nivel?: string | null;

  @ApiPropertyOptional() @IsOptional() @IsString() descripcion?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() tiempoFabricacion?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() testRealizado?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['exitoso', 'con-ajustes', 'fallido'])
  resultado?: string | null;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hallazgos?: string[];
}

export class PrototipoFisicoDataDto {
  @ApiPropertyOptional() @IsOptional() @IsString() objetivo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() productoDescripcion?: string;

  @ApiPropertyOptional({ type: [IteracionFisicaDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IteracionFisicaDto)
  iteraciones?: IteracionFisicaDto[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hallazgosGlobales?: string[];

  @ApiPropertyOptional() @IsOptional() @IsString() costoTotal?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() decisionFinal?: string;
}

export class PrototipoFisicoAnalyzeReqDto {
  @ApiProperty() @IsNumber() @Min(1) toolApplicationId: number;
  @ApiProperty() @IsNumber() @Min(0) currentVersion: number;

  @ApiProperty({ type: PrototipoFisicoDataDto })
  @IsObject()
  @ValidateNested()
  @Type(() => PrototipoFisicoDataDto)
  data: PrototipoFisicoDataDto;
}
