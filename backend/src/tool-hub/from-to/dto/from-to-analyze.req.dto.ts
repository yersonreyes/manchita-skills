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

export class TransformacionDto {
  @ApiProperty({ example: 'abc-123' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'Cobrar tarda 3-7 días' })
  @IsString()
  from: string;

  @ApiProperty({ example: 'Cobrar en segundos' })
  @IsString()
  to: string;
}

export class FromToDataDto {
  @ApiProperty({
    example: 'From-To — App de pagos para freelancers',
    required: false,
  })
  @IsString()
  @IsOptional()
  titulo?: string;

  @ApiProperty({
    example: 'El freelancer pierde días esperando pagos...',
    required: false,
  })
  @IsString()
  @IsOptional()
  contextoActual?: string;

  @ApiProperty({
    example: 'El freelancer gestiona todo desde el celular...',
    required: false,
  })
  @IsString()
  @IsOptional()
  visionFuturo?: string;

  @ApiProperty({ type: [TransformacionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransformacionDto)
  transformaciones: TransformacionDto[];
}

export class FromToAnalyzeReqDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  toolApplicationId: number;

  @ApiProperty({ type: FromToDataDto })
  @ValidateNested()
  @Type(() => FromToDataDto)
  data: FromToDataDto;

  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  currentVersion: number;
}
