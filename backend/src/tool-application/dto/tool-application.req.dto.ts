import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { AttachmentType, ToolApplicationStatus } from '@prisma/client';

export class CreateToolApplicationRequestDto {
  @ApiProperty({ example: 1, description: 'ID de la fase del proyecto' })
  @IsInt()
  @Min(1)
  projectPhaseId: number;

  @ApiProperty({ example: 1, description: 'ID de la herramienta' })
  @IsInt()
  @Min(1)
  toolId: number;

  @ApiProperty({ example: 'Entrevistas de usuario — Sprint 1' })
  @IsString()
  titulo: string;

  @ApiProperty({
    required: false,
    default: {},
    description: 'Datos estructurados en formato JSON',
  })
  @IsOptional()
  structuredData?: object;

  @ApiProperty({
    enum: ToolApplicationStatus,
    required: false,
    default: ToolApplicationStatus.PENDING,
  })
  @IsEnum(ToolApplicationStatus)
  @IsOptional()
  estado?: ToolApplicationStatus;
}

export class UpdateToolApplicationRequestDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  titulo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  structuredData?: object;

  @ApiProperty({ enum: ToolApplicationStatus, required: false })
  @IsEnum(ToolApplicationStatus)
  @IsOptional()
  estado?: ToolApplicationStatus;
}

export class CreateToolApplicationNoteRequestDto {
  @ApiProperty({ example: 'Conclusiones de la sesión de entrevistas' })
  @IsString()
  contenido: string;
}

export class UpdateToolApplicationNoteRequestDto {
  @ApiProperty()
  @IsString()
  contenido: string;
}

export class CreateToolApplicationAttachmentRequestDto {
  @ApiProperty({ example: 'Guía de entrevista' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: 'https://s3.amazonaws.com/bucket/file.pdf' })
  @IsString()
  url: string;

  @ApiProperty({ enum: AttachmentType })
  @IsEnum(AttachmentType)
  tipo: AttachmentType;

  @ApiProperty({ required: false, description: 'Tamaño en bytes' })
  @IsInt()
  @Min(0)
  @IsOptional()
  size?: number | null;
}
