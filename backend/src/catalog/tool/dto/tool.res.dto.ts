import { ApiProperty } from '@nestjs/swagger';

export class ToolDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  codigo: string;

  @ApiProperty()
  nombre: string;

  @ApiProperty()
  descripcion: string;

  @ApiProperty({ required: false })
  comoSeUsa?: string | null;

  @ApiProperty({ required: false })
  ejemplo?: string | null;

  @ApiProperty({ required: false })
  cuandoUsarlo?: string | null;

  @ApiProperty()
  activo: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class GetAllToolsResponseDto {
  @ApiProperty({ type: () => [ToolDto] })
  res: ToolDto[];

  @ApiProperty()
  message: string;

  @ApiProperty()
  code: number;
}

export class ToolResponseDto {
  @ApiProperty({ type: () => ToolDto })
  res: ToolDto;

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
