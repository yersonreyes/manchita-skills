import { AreaProfesional, NivelCompetencia, Senioridad, TipoDisponibilidad } from './user.req.dto';

export interface UserSkillDto {
  id: number;
  tecnologia: string;
  nivel: NivelCompetencia;
}

export interface UserDto {
  id: number;
  email: string;
  nombre: string;
  isSuperAdmin: boolean;
  activo: boolean;
  telefono: string | null;
  zonaHoraria: string | null;
  area: AreaProfesional | null;
  senioridad: Senioridad | null;
  disponibilidad: TipoDisponibilidad | null;
  horasSemanales: number | null;
  lenguajes: string[];
  frameworks: string[];
  basesDeDatos: string[];
  herramientas: string[];
  bio: string | null;
  avatarUrl: string | null;
  userSkills: UserSkillDto[];
  createdAt: string;
  updatedAt: string;
  userRoles?: { role: { id: number; codigo: string; nombre: string } }[];
}
