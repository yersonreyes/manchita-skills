import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export enum ImpactoInsightEnum {
  ALTO = 'alto',
  MEDIO = 'medio',
  BAJO = 'bajo',
}

export class InsightItemDto {
  @ApiProperty({ example: 'abc-123' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'Los usuarios no encuentran el botón de checkout' })
  @IsString()
  texto: string;

  @ApiProperty({ enum: ImpactoInsightEnum, example: 'alto' })
  @IsEnum(ImpactoInsightEnum)
  impacto: ImpactoInsightEnum;
}

export class InsightClusterDto {
  @ApiProperty({ example: 'cluster-123' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'Facilidad de Uso' })
  @IsString()
  @IsOptional()
  nombre?: string;

  @ApiProperty({ type: [InsightItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InsightItemDto)
  insights: InsightItemDto[];
}

export class InsightsClusterDataDto {
  @ApiProperty({
    example: '20 entrevistas con usuarios de e-commerce',
    required: false,
  })
  @IsString()
  @IsOptional()
  contexto?: string;

  @ApiProperty({ type: [InsightClusterDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InsightClusterDto)
  clusters: InsightClusterDto[];
}

export class InsightsClusterAnalyzeReqDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  toolApplicationId: number;

  @ApiProperty({ type: InsightsClusterDataDto })
  @ValidateNested()
  @Type(() => InsightsClusterDataDto)
  data: InsightsClusterDataDto;

  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  currentVersion: number;
}
