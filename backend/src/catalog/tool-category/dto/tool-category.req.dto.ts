import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateToolCategoryRequestDto {
  @ApiProperty({ example: 'USER_RESEARCH' })
  @IsString()
  codigo: string;

  @ApiProperty({ example: 'Investigación de usuario' })
  @IsString()
  nombre: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  descripcion?: string | null;

  @ApiProperty({
    example: 1,
    description: 'ID de la fase de diseño a la que pertenece',
  })
  @IsInt()
  @Min(1)
  phaseId: number;

  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}

export class UpdateToolCategoryRequestDto {
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
  descripcion?: string | null;

  @ApiProperty({ required: false })
  @IsInt()
  @Min(1)
  @IsOptional()
  phaseId?: number;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
