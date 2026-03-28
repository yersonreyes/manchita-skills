import { ApiProperty } from '@nestjs/swagger';

export class ToolCategoryDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  codigo: string;

  @ApiProperty()
  nombre: string;

  @ApiProperty({ required: false })
  descripcion?: string | null;

  @ApiProperty()
  phaseId: number;

  @ApiProperty()
  activo: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class GetAllToolCategoriesResponseDto {
  @ApiProperty({ type: () => [ToolCategoryDto] })
  res: ToolCategoryDto[];

  @ApiProperty()
  message: string;

  @ApiProperty()
  code: number;
}

export class ToolCategoryResponseDto {
  @ApiProperty({ type: () => ToolCategoryDto })
  res: ToolCategoryDto;

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
