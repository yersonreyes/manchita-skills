import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class CriterioSeleccionDto {
  @ApiProperty() @IsString() id: string;
  @ApiProperty() @IsString() nombre: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  peso?: number;
}

export class PuntuacionDto {
  @ApiProperty() @IsString() criterioId: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  valor?: number;
}

export class IdeaSeleccionDto {
  @ApiProperty() @IsString() id: string;
  @ApiPropertyOptional() @IsOptional() @IsString() texto?: string;
  @ApiProperty({ type: [PuntuacionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PuntuacionDto)
  puntuaciones: PuntuacionDto[];
  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['pendiente', 'seleccionada', 'backlog', 'descartada'])
  estado?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() siguientePaso?: string;
}

export class SeleccionIdeasDataDto {
  @ApiPropertyOptional() @IsOptional() @IsString() contexto?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() metodo?: string;
  @ApiProperty({ type: [CriterioSeleccionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CriterioSeleccionDto)
  criterios: CriterioSeleccionDto[];
  @ApiProperty({ type: [IdeaSeleccionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IdeaSeleccionDto)
  ideas: IdeaSeleccionDto[];
  @ApiPropertyOptional() @IsOptional() @IsString() decision?: string;
}

export class SeleccionIdeasAnalyzeReqDto {
  @ApiProperty() @IsNumber() toolApplicationId: number;
  @ApiProperty({ type: SeleccionIdeasDataDto })
  @ValidateNested()
  @Type(() => SeleccionIdeasDataDto)
  data: SeleccionIdeasDataDto;
  @ApiPropertyOptional({
    description: 'Scores ponderados pre-calculados: { ideaId: score }',
  })
  @IsOptional()
  @IsObject()
  ideaScores?: Record<string, number>;
  @ApiProperty() @IsNumber() currentVersion: number;
}
