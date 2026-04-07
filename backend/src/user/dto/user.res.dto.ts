import { ApiProperty } from '@nestjs/swagger';

export class UserSkillDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  tecnologia: string;

  @ApiProperty()
  nivel: string;
}

export class UserDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  nombre: string;

  @ApiProperty()
  isSuperAdmin: boolean;

  @ApiProperty()
  activo: boolean;

  @ApiProperty({ required: false, nullable: true })
  telefono: string | null;

  @ApiProperty({ required: false, nullable: true })
  zonaHoraria: string | null;

  @ApiProperty({ required: false, nullable: true })
  area: string | null;

  @ApiProperty({ required: false, nullable: true })
  senioridad: string | null;

  @ApiProperty({ required: false, nullable: true })
  disponibilidad: string | null;

  @ApiProperty({ required: false, nullable: true })
  horasSemanales: number | null;

  @ApiProperty({ type: [String] })
  lenguajes: string[];

  @ApiProperty({ type: [String] })
  frameworks: string[];

  @ApiProperty({ type: [String] })
  basesDeDatos: string[];

  @ApiProperty({ type: [String] })
  herramientas: string[];

  @ApiProperty({ required: false, nullable: true })
  bio: string | null;

  @ApiProperty({ required: false, nullable: true })
  avatarUrl: string | null;

  @ApiProperty({ type: () => [UserSkillDto] })
  userSkills: UserSkillDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class GetAllUsersResponseDto {
  @ApiProperty({ type: () => [UserDto] })
  res: UserDto[];

  @ApiProperty()
  message: string;

  @ApiProperty()
  code: number;
}

export class UserResponseDto {
  @ApiProperty({ type: () => UserDto })
  res: UserDto;

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
