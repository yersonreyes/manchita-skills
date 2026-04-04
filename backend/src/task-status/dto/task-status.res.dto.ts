import { ApiProperty } from '@nestjs/swagger';

export class TaskStatusDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  projectId: number;

  @ApiProperty()
  nombre: string;

  @ApiProperty()
  color: string;

  @ApiProperty()
  orden: number;

  @ApiProperty()
  isFinal: boolean;

  @ApiProperty()
  activo: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class TaskStatusResponseDto {
  @ApiProperty({ type: () => TaskStatusDto })
  res: TaskStatusDto;

  @ApiProperty()
  message: string;

  @ApiProperty()
  code: number;
}

export class TaskStatusListResponseDto {
  @ApiProperty({ type: () => [TaskStatusDto] })
  res: TaskStatusDto[];

  @ApiProperty()
  message: string;

  @ApiProperty()
  code: number;
}
