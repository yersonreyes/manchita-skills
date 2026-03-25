export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: string;
}

export interface User {
  id: number;
  email: string;
  nombre: string;
  isSuperAdmin: boolean;
  activo: boolean;
}

export interface JwtPayload {
  sub: number;
  email: string;
  nombre?: string;
  permissions: string[];
  isSuperAdmin: boolean;
  exp?: number;
  iat?: number;
}

export interface RegisterResponse {
  res: User;
  message: string;
  code: number;
}

export interface MessageResponse {
  res: null;
  message: string;
  code: number;
}
