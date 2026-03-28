import { ApiProperty } from '@nestjs/swagger';

export class DesignPhaseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  codigo: string;

  @ApiProperty()
  nombre: string;

  @ApiProperty()
  descripcion: string;

  @ApiProperty()
  orden: number;

  @ApiProperty()
  activo: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class GetAllDesignPhasesResponseDto {
  @ApiProperty({ type: () => [DesignPhaseDto] })
  res: DesignPhaseDto[];

  @ApiProperty()
  message: string;

  @ApiProperty()
  code: number;
}

export class DesignPhaseResponseDto {
  @ApiProperty({ type: () => DesignPhaseDto })
  res: DesignPhaseDto;

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
