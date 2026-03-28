export interface DesignPhaseResDto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  orden: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ToolResDto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  comoSeUsa?: string | null;
  ejemplo?: string | null;
  cuandoUsarlo?: string | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}
