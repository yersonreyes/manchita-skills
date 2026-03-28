import { ApiProperty } from '@nestjs/swagger';

export class ProjectDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  nombre: string;

  @ApiProperty({ required: false })
  descripcion?: string | null;

  @ApiProperty()
  estado: string;

  @ApiProperty()
  ownerId: number;

  @ApiProperty()
  activo: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class GetAllProjectsResponseDto {
  @ApiProperty({ type: () => [ProjectDto] })
  res: ProjectDto[];

  @ApiProperty()
  message: string;

  @ApiProperty()
  code: number;
}

export class ProjectResponseDto {
  @ApiProperty({ type: () => ProjectDto })
  res: ProjectDto;

  @ApiProperty()
  message: string;

  @ApiProperty()
  code: number;
}

export class ErrorResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty()
  code: number;
}
