import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WikiPageResDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  projectId: number;

  @ApiPropertyOptional({ example: null, nullable: true })
  parentId: number | null;

  @ApiProperty({ example: 'Investigación de usuarios' })
  titulo: string;

  @ApiProperty({ example: '# Investigación\n\nContenido aquí...' })
  contenido: string;

  @ApiPropertyOptional({ example: '📝', nullable: true })
  icono: string | null;

  @ApiPropertyOptional({ example: 'emerald', nullable: true })
  banner: string | null;

  @ApiProperty({ example: 0 })
  orden: number;

  @ApiProperty({ example: true })
  activo: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ example: 1 })
  createdById: number;
}
