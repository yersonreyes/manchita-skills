import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateTaskStatusRequestDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  projectId: number;

  @ApiProperty({ example: 'En Progreso' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: '#F59E0B' })
  @IsString()
  color: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(0)
  orden: number;

  @ApiProperty({ required: false, default: false })
  @IsBoolean()
  @IsOptional()
  isFinal?: boolean;
}

export class UpdateTaskStatusRequestDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  nombre?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  orden?: number;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isFinal?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
