export interface PermissionDto {
  id: number;
  codigo: string;
  descripcion?: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoleDto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  permissions?: PermissionDto[];
  createdAt: string;
  updatedAt: string;
}
