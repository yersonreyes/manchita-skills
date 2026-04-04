import { ApiProperty } from '@nestjs/swagger';

export class TaskTagDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  projectId: number;

  @ApiProperty()
  nombre: string;

  @ApiProperty()
  color: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class TaskTagResponseDto {
  @ApiProperty({ type: () => TaskTagDto })
  res: TaskTagDto;

  @ApiProperty()
  message: string;

  @ApiProperty()
  code: number;
}

export class TaskTagListResponseDto {
  @ApiProperty({ type: () => [TaskTagDto] })
  res: TaskTagDto[];

  @ApiProperty()
  message: string;

  @ApiProperty()
  code: number;
}
