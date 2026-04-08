import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  AreaProfesional,
  NivelCompetencia,
  Senioridad,
  TipoDisponibilidad,
} from '@prisma/client';

export class CreateUserRequestDto {
  @ApiProperty({ example: 'nuevo@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  nombre: string;

  @ApiProperty({ minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ required: false, default: false })
  @IsBoolean()
  @IsOptional()
  isSuperAdmin?: boolean;

  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}

export class UpdateUserRequestDto {
  @ApiProperty({ required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  nombre?: string;

  @ApiProperty({ required: false })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isSuperAdmin?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  // Perfil profesional
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  telefono?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  zonaHoraria?: string;

  @ApiProperty({ enum: AreaProfesional, required: false })
  @IsEnum(AreaProfesional)
  @IsOptional()
  area?: AreaProfesional;

  @ApiProperty({ enum: Senioridad, required: false })
  @IsEnum(Senioridad)
  @IsOptional()
  senioridad?: Senioridad;

  @ApiProperty({ enum: TipoDisponibilidad, required: false })
  @IsEnum(TipoDisponibilidad)
  @IsOptional()
  disponibilidad?: TipoDisponibilidad;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  horasSemanales?: number;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  lenguajes?: string[];

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  frameworks?: string[];

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  basesDeDatos?: string[];

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  herramientas?: string[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({ required: false, nullable: true })
  @IsString()
  @IsOptional()
  avatarUrl?: string;
}

export class AssignRolesRequestDto {
  @ApiProperty({
    type: () => [Number],
    description: 'IDs de los roles a asignar',
  })
  @IsArray()
  @IsNumber({}, { each: true })
  roleIds: number[];
}

export class SkillItemDto {
  @ApiProperty()
  @IsString()
  tecnologia: string;

  @ApiProperty({ enum: NivelCompetencia })
  @IsEnum(NivelCompetencia)
  nivel: NivelCompetencia;
}

export class UpsertUserSkillsDto {
  @ApiProperty({ type: () => [SkillItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillItemDto)
  skills: SkillItemDto[];
}
