import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateDesignPhaseRequestDto {
  @ApiProperty({ example: 'DISCOVER' })
  @IsString()
  codigo: string;

  @ApiProperty({ example: 'Descubrir' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: 'Primera fase del proceso Double Diamond' })
  @IsString()
  descripcion: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  orden: number;

  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}

export class UpdateDesignPhaseRequestDto {
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
  @IsInt()
  @Min(1)
  @IsOptional()
  orden?: number;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
