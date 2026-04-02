import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class KeyFactItemDto {
  @ApiProperty({ example: 'abc-123' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'El 68% de los usuarios abandona el checkout antes de completar' })
  @IsString()
  descripcion: string;

  @ApiProperty({ example: 'Analytics (3 meses)', required: false })
  @IsString()
  @IsOptional()
  fuente?: string;

  @ApiProperty({ example: 'Priorizar optimización del flujo de checkout', required: false })
  @IsString()
  @IsOptional()
  implicacion?: string;
}

export class KeyFactsDataDto {
  @ApiProperty({ example: 'Investigación con 12 usuarios de e-commerce', required: false })
  @IsString()
  @IsOptional()
  contexto?: string;

  @ApiProperty({ type: [KeyFactItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KeyFactItemDto)
  facts: KeyFactItemDto[];
}

export class KeyFactsAnalyzeReqDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  toolApplicationId: number;

  @ApiProperty({ type: KeyFactsDataDto })
  @ValidateNested()
  @Type(() => KeyFactsDataDto)
  data: KeyFactsDataDto;

  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  currentVersion: number;
}
