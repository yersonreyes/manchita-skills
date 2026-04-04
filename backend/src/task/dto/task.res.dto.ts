import { ApiProperty } from '@nestjs/swagger';
import { TaskPriority } from '@prisma/client';

export class TaskDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  projectId: number;

  @ApiProperty({ required: false })
  parentId: number | null;

  @ApiProperty()
  statusId: number;

  @ApiProperty({ required: false })
  toolApplicationId: number | null;

  @ApiProperty({ required: false })
  assigneeId: number | null;

  @ApiProperty()
  createdById: number;

  @ApiProperty()
  titulo: string;

  @ApiProperty({ required: false })
  descripcion: string | null;

  @ApiProperty({ enum: TaskPriority })
  prioridad: TaskPriority;

  @ApiProperty({ required: false })
  fechaInicio: Date | null;

  @ApiProperty({ required: false })
  fechaVencimiento: Date | null;

  @ApiProperty({ required: false })
  fechaCompletado: Date | null;

  @ApiProperty({ required: false })
  estimacion: number | null;

  @ApiProperty()
  orden: number;

  @ApiProperty()
  activo: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  _subtaskCount: number;

  @ApiProperty()
  _subtaskCompletedCount: number;
}

export class TaskResponseDto {
  @ApiProperty({ type: () => TaskDto })
  res: TaskDto;

  @ApiProperty()
  message: string;

  @ApiProperty()
  code: number;
}

export class TaskListResponseDto {
  @ApiProperty({ type: () => [TaskDto] })
  res: TaskDto[];

  @ApiProperty()
  message: string;

  @ApiProperty()
  code: number;
}
