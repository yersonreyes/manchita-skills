export type ProjectStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
export type ProjectMemberRole = 'OWNER' | 'EDITOR' | 'VIEWER';
export type TipoProyecto = 'STARTUP' | 'PRODUCTO_DIGITAL' | 'INVESTIGACION_UX' | 'PROYECTO_INTERNO' | 'SERVICIO' | 'PROCESO' | 'OTRO';
export type EtapaProyecto = 'IDEA' | 'EXPLORACION' | 'VALIDACION' | 'DESARROLLO' | 'LANZAMIENTO' | 'CRECIMIENTO' | 'MADUREZ';
export type Moneda =
  | 'USD' | 'EUR'
  | 'ARS' | 'BRL' | 'CLP' | 'COP' | 'MXN' | 'PEN' | 'UYU'
  | 'PYG' | 'BOB' | 'VES' | 'CRC' | 'DOP' | 'GTQ' | 'HNL'
  | 'NIO' | 'PAB' | 'CUP';

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
  presupuesto?: number | null;
  moneda?: Moneda | null;
  activo?: boolean;
}

export interface UpsertMemberReqDto {
  userId: number;
  role: ProjectMemberRole;
  // Ficha técnica del miembro en el proyecto
  cargo?: string;
  fechaIngreso?: string | null;
  horasSemanalesProyecto?: number | null;
  responsabilidades?: string[];
  entregables?: string[];
  modulosAsignados?: string[];
  participaDaily?: boolean;
  participaPlanning?: boolean;
  participaReview?: boolean;
  participaRetro?: boolean;
  objetivos?: string;
  observaciones?: string;
  accesos?: {
    repositorio?: string;
    ambientes?: string;
    herramientas?: string;
    credenciales?: string;
  };
}
