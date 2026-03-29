export type ProjectStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
export type ProjectMemberRole = 'OWNER' | 'EDITOR' | 'VIEWER';
export type TipoProyecto = 'STARTUP' | 'PRODUCTO_DIGITAL' | 'INVESTIGACION_UX' | 'PROYECTO_INTERNO' | 'SERVICIO' | 'PROCESO' | 'OTRO';
export type EtapaProyecto = 'IDEA' | 'EXPLORACION' | 'VALIDACION' | 'DESARROLLO' | 'LANZAMIENTO' | 'CRECIMIENTO' | 'MADUREZ';

export interface CreateProjectReqDto {
  nombre: string;
  descripcion?: string | null;
  tipo?: TipoProyecto | null;
  etapa?: EtapaProyecto | null;
  sector?: string | null;
  contexto?: string | null;
  estado?: ProjectStatus;
  activo?: boolean;
}

export interface UpdateProjectReqDto {
  nombre?: string;
  descripcion?: string | null;
  tipo?: TipoProyecto | null;
  etapa?: EtapaProyecto | null;
  sector?: string | null;
  contexto?: string | null;
  estado?: ProjectStatus;
  activo?: boolean;
}

export interface UpsertMemberReqDto {
  userId: number;
  role: ProjectMemberRole;
}
