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
}

export interface AssignRolesRequest {
  roleIds: number[];
}
