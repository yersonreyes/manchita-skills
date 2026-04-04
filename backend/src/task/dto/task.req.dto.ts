import { ApiProperty } from '@nestjs/swagger';
import { TaskPriority } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateTaskRequestDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  projectId: number;

  @ApiProperty({ required: false, example: null })
  @IsInt()
  @Min(1)
  @IsOptional()
  parentId?: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  statusId: number;

  @ApiProperty({ required: false })
  @IsInt()
  @Min(1)
  @IsOptional()
  toolApplicationId?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @Min(1)
  @IsOptional()
  assigneeId?: number;

  @ApiProperty({ example: 'Disenar wireframes del flujo de login' })
  @IsString()
  titulo: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ enum: TaskPriority, required: false, default: 'MEDIUM' })
  @IsEnum(TaskPriority)
  @IsOptional()
  prioridad?: TaskPriority;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  fechaInicio?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  fechaVencimiento?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  estimacion?: number;

  @ApiProperty({ required: false, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  orden?: number;
}

export class UpdateTaskRequestDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  titulo?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  descripcion?: string | null;

  @ApiProperty({ enum: TaskPriority, required: false })
  @IsEnum(TaskPriority)
  @IsOptional()
  prioridad?: TaskPriority;

  @ApiProperty({ required: false })
  @IsInt()
  @Min(1)
  @IsOptional()
  statusId?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @Min(1)
  @IsOptional()
  assigneeId?: number | null;

  @ApiProperty({ required: false })
  @IsInt()
  @Min(1)
  @IsOptional()
  toolApplicationId?: number | null;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  fechaInicio?: string | null;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  fechaVencimiento?: string | null;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  estimacion?: number | null;
}

export class MoveTaskRequestDto {
  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  statusId: number;

  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  orden: number;
}

export class ReorderTaskRequestDto {
  @ApiProperty({ example: 3 })
  @IsInt()
  @Min(0)
  orden: number;
}

export class AssignTagRequestDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  tagId: number;
}
