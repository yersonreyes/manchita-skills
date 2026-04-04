import { ApiProperty } from '@nestjs/swagger';
import { TaskAction } from '@prisma/client';

export class TaskActivityDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  taskId: number;

  @ApiProperty()
  userId: number;

  @ApiProperty({ enum: TaskAction })
  accion: TaskAction;

  @ApiProperty({ required: false })
  campoModificado: string | null;

  @ApiProperty({ required: false })
  valorAnterior: string | null;

  @ApiProperty({ required: false })
  valorNuevo: string | null;

  @ApiProperty()
  createdAt: Date;
}

export class TaskActivityListResponseDto {
  @ApiProperty({ type: () => [TaskActivityDto] })
  res: TaskActivityDto[];

  @ApiProperty()
  message: string;

  @ApiProperty()
  code: number;

  @ApiProperty()
  total: number;
}
