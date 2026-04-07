export type AreaProfesional = 'FRONTEND' | 'BACKEND' | 'FULLSTACK' | 'QA' | 'DEVOPS' | 'UX' | 'DISENO' | 'PRODUCTO' | 'DATOS' | 'MANAGEMENT' | 'OTRO';
export type Senioridad = 'JUNIOR' | 'SEMI_SENIOR' | 'SENIOR' | 'LEAD' | 'PRINCIPAL';
export type TipoDisponibilidad = 'FULL_TIME' | 'PART_TIME' | 'FREELANCE' | 'CONSULTOR';
export type NivelCompetencia = 'BASICO' | 'INTERMEDIO' | 'AVANZADO';

export interface CreateUserRequest {
  email: string;
  nombre: string;
  password: string;
  isSuperAdmin?: boolean;
  activo?: boolean;
}

export interface UpdateUserRequest {
  email?: string;
  nombre?: string;
  password?: string;
  isSuperAdmin?: boolean;
  activo?: boolean;
  telefono?: string;
  zonaHoraria?: string;
  area?: AreaProfesional | null;
  senioridad?: Senioridad | null;
  disponibilidad?: TipoDisponibilidad | null;
  horasSemanales?: number | null;
  lenguajes?: string[];
  frameworks?: string[];
  basesDeDatos?: string[];
  herramientas?: string[];
  bio?: string;
}

export interface AssignRolesRequest {
  roleIds: number[];
}

export interface SkillItem {
  tecnologia: string;
  nivel: NivelCompetencia;
}

export interface UpsertUserSkillsRequest {
  skills: SkillItem[];
}
