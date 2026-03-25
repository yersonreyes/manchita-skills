import { SetMetadata } from '@nestjs/common';

// Marca un endpoint como público — no requiere JWT ni permisos
export const Public = () => SetMetadata('isPublic', true);

// Requiere uno o más permisos (lógica AND — debe tener TODOS)
export const RequirePermission = (...permissions: string[]) =>
  SetMetadata('permissions', permissions);

// Solo super administradores pueden acceder
export const IsSuperAdmin = () => SetMetadata('isSuperAdminRequired', true);
