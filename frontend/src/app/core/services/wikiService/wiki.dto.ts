export interface WikiPageResDto {
  id: number;
  projectId: number;
  parentId: number | null;
  titulo: string;
  contenido: string;
  icono: string | null;
  banner: string | null;
  orden: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  createdById: number;
}

export interface CreateWikiPageReqDto {
  projectId: number;
  parentId?: number | null;
  titulo: string;
  contenido?: string;
  orden?: number;
}

export interface UpdateWikiPageReqDto {
  titulo?: string;
  contenido?: string;
  icono?: string | null;
  banner?: string | null;
  orden?: number;
  parentId?: number | null;
}
