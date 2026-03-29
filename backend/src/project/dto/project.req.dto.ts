import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { EtapaProyecto, ProjectMemberRole, ProjectStatus, TipoProyecto } from '@prisma/client';

export class CreateProjectRequestDto {
  @ApiProperty({ example: 'Rediseño App Móvil' })
  @IsString()
  nombre: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  descripcion?: string | null;

  @ApiProperty({ enum: TipoProyecto, required: false })
  @IsEnum(TipoProyecto)
  @IsOptional()
  tipo?: TipoProyecto;

  @ApiProperty({ enum: EtapaProyecto, required: false })
  @IsEnum(EtapaProyecto)
  @IsOptional()
  etapa?: EtapaProyecto;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  sector?: string | null;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  contexto?: string | null;

  @ApiProperty({ enum: ProjectStatus, required: false, default: ProjectStatus.DRAFT })
  @IsEnum(ProjectStatus)
  @IsOptional()
  estado?: ProjectStatus;

  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}

export class UpdateProjectRequestDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  nombre?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  descripcion?: string | null;

  @ApiProperty({ enum: TipoProyecto, required: false })
  @IsEnum(TipoProyecto)
  @IsOptional()
  tipo?: TipoProyecto | null;

  @ApiProperty({ enum: EtapaProyecto, required: false })
  @IsEnum(EtapaProyecto)
  @IsOptional()
  etapa?: EtapaProyecto | null;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  sector?: string | null;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  contexto?: string | null;

  @ApiProperty({ enum: ProjectStatus, required: false })
  @IsEnum(ProjectStatus)
  @IsOptional()
  estado?: ProjectStatus;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}

export class UpsertProjectMemberRequestDto {
  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  userId: number;

  @ApiProperty({ enum: ProjectMemberRole })
  @IsEnum(ProjectMemberRole)
  role: ProjectMemberRole;
}
