import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class UpdateWikiPageDto {
  @ApiPropertyOptional({ example: 'Nuevo título' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  titulo?: string;

  @ApiPropertyOptional({ example: '# Contenido actualizado' })
  @IsOptional()
  @IsString()
  contenido?: string;

  @ApiPropertyOptional({ example: '📝', nullable: true })
  @IsOptional()
  @IsString()
  icono?: string | null;

  @ApiPropertyOptional({ example: 'emerald', nullable: true })
  @IsOptional()
  @IsString()
  banner?: string | null;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  orden?: number;

  @ApiPropertyOptional({ example: 5, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  parentId?: number | null;
}
