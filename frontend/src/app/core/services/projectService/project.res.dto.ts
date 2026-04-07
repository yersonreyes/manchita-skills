import { EtapaProyecto, ProjectMemberRole, ProjectStatus, TipoProyecto } from './project.req.dto';
import { ProjectPhaseResDto } from '../projectPhaseService/project-phase.res.dto';

export interface ProjectUserDto {
  id: number;
  nombre: string;
  email: string;
}

export interface ProjectMemberDto {
  id?: number;
  user: ProjectUserDto;
  role: ProjectMemberRole;
  cargo?: string | null;
  fechaIngreso?: string | null;
  horasSemanalesProyecto?: number | null;
  responsabilidades?: string[];
  entregables?: string[];
  modulosAsignados?: string[];
  participaDaily?: boolean;
  participaPlanning?: boolean;
  participaReview?: boolean;
  participaRetro?: boolean;
  objetivos?: string | null;
  observaciones?: string | null;
  accesos?: Record<string, any> | null;
}

export interface ProjectResDto {
  id: number;
  nombre: string;
  descripcion?: string | null;
  tipo?: TipoProyecto | null;
  etapa?: EtapaProyecto | null;
  sector?: string | null;
  contexto?: string | null;
  estado: ProjectStatus;
  activo: boolean;
  owner: ProjectUserDto;
  members: ProjectMemberDto[];
  phases?: ProjectPhaseResDto[];
  createdAt: string;
  updatedAt: string;
}
