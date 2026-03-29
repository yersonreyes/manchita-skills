import { ApiProperty } from '@nestjs/swagger';
import { EtapaProyecto, TipoProyecto } from '@prisma/client';

export class ProjectDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  nombre: string;

  @ApiProperty({ required: false })
  descripcion?: string | null;

  @ApiProperty({ enum: TipoProyecto, required: false })
  tipo?: TipoProyecto | null;

  @ApiProperty({ enum: EtapaProyecto, required: false })
  etapa?: EtapaProyecto | null;

  @ApiProperty({ required: false })
  sector?: string | null;

  @ApiProperty({ required: false })
  contexto?: string | null;

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
