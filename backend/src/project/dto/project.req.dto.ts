import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  EtapaProyecto,
  Moneda,
  ProjectMemberRole,
  ProjectStatus,
  TipoProyecto,
} from '@prisma/client';

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

  @ApiProperty({
    enum: ProjectStatus,
    required: false,
    default: ProjectStatus.DRAFT,
  })
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
  @IsNumber()
  @IsOptional()
  presupuesto?: number | null;

  @ApiProperty({ enum: Moneda, required: false })
  @IsEnum(Moneda)
  @IsOptional()
  moneda?: Moneda | null;

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

  // Ficha técnica del miembro en el proyecto
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  cargo?: string;

  @ApiProperty({ required: false })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  fechaIngreso?: Date;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  horasSemanalesProyecto?: number;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  responsabilidades?: string[];

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  entregables?: string[];

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  modulosAsignados?: string[];

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  participaDaily?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  participaPlanning?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  participaReview?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  participaRetro?: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  objetivos?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  observaciones?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  accesos?: Record<string, any>;
}
