export type ProjectStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
export type ProjectMemberRole = 'OWNER' | 'EDITOR' | 'VIEWER';

export interface CreateProjectReqDto {
  nombre: string;
  descripcion?: string | null;
  estado?: ProjectStatus;
  activo?: boolean;
}

export interface UpsertMemberReqDto {
  userId: number;
  role: ProjectMemberRole;
}
