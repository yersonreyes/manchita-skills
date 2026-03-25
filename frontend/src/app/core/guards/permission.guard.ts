import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { PermissionCheckService } from '../services/common/permission-check.service';

export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const permissionService = inject(PermissionCheckService);
  const router = inject(Router);
  const requiredPermissions = route.data?.['permissions'] as string[] | undefined;

  if (!requiredPermissions || requiredPermissions.length === 0) return true;

  const hasAccess = permissionService.hasAllPermissions(requiredPermissions);
  if (hasAccess) return true;

  console.warn(`Acceso denegado: faltan permisos [${requiredPermissions.join(', ')}]`);
  void router.navigate(['/platform']);
  return false;
};
