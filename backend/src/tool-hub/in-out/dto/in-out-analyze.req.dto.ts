import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsIn,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class InOutInputItemDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  id: string;

  @ApiProperty({ enum: ['informacion', 'recursos', 'materiales', 'externos'] })
  @IsIn(['informacion', 'recursos', 'materiales', 'externos'])
  tipo: 'informacion' | 'recursos' | 'materiales' | 'externos';

  @ApiProperty({ example: 'Datos del usuario registrado' })
  @IsString()
  descripcion: string;
}

export class InOutOutputItemDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  @IsUUID()
  id: string;

  @ApiProperty({ enum: ['producto', 'datos', 'feedback', 'desperdicio'] })
  @IsIn(['producto', 'datos', 'feedback', 'desperdicio'])
  tipo: 'producto' | 'datos' | 'feedback' | 'desperdicio';

  @ApiProperty({ example: 'Usuario activo en la plataforma' })
  @IsString()
  descripcion: string;
}

export class InOutDataDto {
  @ApiProperty({ example: 'Proceso de onboarding de usuarios' })
  @IsString()
  proceso: string;

  @ApiProperty({ type: [InOutInputItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InOutInputItemDto)
  inputs: InOutInputItemDto[];

  @ApiProperty({ type: [InOutOutputItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InOutOutputItemDto)
  outputs: InOutOutputItemDto[];
}

export class InOutAnalyzeReqDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  toolApplicationId: number;

  @ApiProperty({ type: InOutDataDto })
  @ValidateNested()
  @Type(() => InOutDataDto)
  data: InOutDataDto;

  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  currentVersion: number;
}
