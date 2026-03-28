import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateToolRequestDto {
  @ApiProperty({ example: 'USER_INTERVIEW' })
  @IsString()
  codigo: string;

  @ApiProperty({ example: 'Entrevista de usuario' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: 'Técnica para entender necesidades del usuario' })
  @IsString()
  descripcion: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  comoSeUsa?: string | null;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  ejemplo?: string | null;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  cuandoUsarlo?: string | null;

  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}

export class UpdateToolRequestDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  codigo?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  nombre?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  comoSeUsa?: string | null;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  ejemplo?: string | null;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  cuandoUsarlo?: string | null;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}

export class AssignToolCategoriesRequestDto {
  @ApiProperty({
    type: () => [Number],
    description: 'IDs de las categorías a asignar',
  })
  @IsArray()
  @IsNumber({}, { each: true })
  categoryIds: number[];
}
