import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateWikiPageDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  projectId: number;

  @ApiPropertyOptional({ example: null, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  parentId?: number | null;

  @ApiProperty({ example: 'Investigación de usuarios' })
  @IsString()
  @MinLength(1)
  titulo: string;

  @ApiPropertyOptional({ example: '# Investigación\n\nContenido aquí...' })
  @IsOptional()
  @IsString()
  contenido?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  orden?: number;
}
