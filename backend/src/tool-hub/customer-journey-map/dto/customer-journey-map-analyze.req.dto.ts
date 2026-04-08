import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CjmEtapaDto {
  @ApiProperty({ example: 'uuid-etapa-1' })
  @IsString()
  id: string;

  @ApiPropertyOptional({ example: 'Descubrimiento' })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiProperty({
    type: [String],
    example: ['Busca en Google', 'Ve ads en redes'],
  })
  @IsArray()
  @IsString({ each: true })
  acciones: string[];

  @ApiProperty({ type: [String], example: ['Curiosa', 'Expectante'] })
  @IsArray()
  @IsString({ each: true })
  emociones: string[];

  @ApiProperty({ type: [String], example: ['Instagram', 'Web'] })
  @IsArray()
  @IsString({ each: true })
  touchpoints: string[];

  @ApiProperty({ type: [String], example: ['Precio poco claro'] })
  @IsArray()
  @IsString({ each: true })
  painPoints: string[];

  @ApiProperty({
    type: [String],
    example: ['Simplificar comparación de precios'],
  })
  @IsArray()
  @IsString({ each: true })
  oportunidades: string[];
}

export class CustomerJourneyMapDataDto {
  @ApiPropertyOptional({
    example: 'María, 35 años, compradora online frecuente',
  })
  @IsOptional()
  @IsString()
  personaje?: string;

  @ApiPropertyOptional({
    example: 'Usuario comprando por primera vez en la app',
  })
  @IsOptional()
  @IsString()
  escenario?: string;

  @ApiProperty({ type: [CjmEtapaDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CjmEtapaDto)
  etapas: CjmEtapaDto[];
}

export class CustomerJourneyMapAnalyzeReqDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  toolApplicationId: number;

  @ApiProperty({ type: CustomerJourneyMapDataDto })
  @ValidateNested()
  @Type(() => CustomerJourneyMapDataDto)
  data: CustomerJourneyMapDataDto;

  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  currentVersion: number;
}
