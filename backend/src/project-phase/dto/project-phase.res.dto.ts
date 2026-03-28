import { ApiProperty } from '@nestjs/swagger';

export class ProjectPhaseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  projectId: number;

  @ApiProperty()
  phaseId: number;

  @ApiProperty()
  estado: string;

  @ApiProperty()
  orden: number;

  @ApiProperty({ required: false })
  notas?: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class GetAllProjectPhasesResponseDto {
  @ApiProperty({ type: () => [ProjectPhaseDto] })
  res: ProjectPhaseDto[];

  @ApiProperty()
  message: string;

  @ApiProperty()
  code: number;
}

export class ProjectPhaseResponseDto {
  @ApiProperty({ type: () => ProjectPhaseDto })
  res: ProjectPhaseDto;

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
