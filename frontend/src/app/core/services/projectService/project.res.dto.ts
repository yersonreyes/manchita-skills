import { ProjectMemberRole, ProjectStatus } from './project.req.dto';

export interface ProjectUserDto {
  id: number;
  nombre: string;
  email: string;
}

export interface ProjectMemberDto {
  user: ProjectUserDto;
  role: ProjectMemberRole;
}

export interface ProjectResDto {
  id: number;
  nombre: string;
  descripcion?: string | null;
  estado: ProjectStatus;
  activo: boolean;
  owner: ProjectUserDto;
  members: ProjectMemberDto[];
  createdAt: string;
  updatedAt: string;
}
