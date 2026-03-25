export interface UserDto {
  id: number;
  email: string;
  nombre: string;
  isSuperAdmin: boolean;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  userRoles?: { role: { id: number; codigo: string; nombre: string } }[];
}
