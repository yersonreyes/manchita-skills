import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. ¿Es ruta pública?
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // 2. ¿Requiere permisos específicos?
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    // 3. Obtener usuario del request
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Si no hay usuario autenticado (ruta de auth bypasseada), permitir
    if (!user) return true;

    // 4. ¿Es SuperAdmin?
    if (user.isSuperAdmin) return true;

    // 5. ¿Solo SuperAdmin puede acceder?
    const isSuperAdminRequired = this.reflector.getAllAndOverride<boolean>(
      'isSuperAdminRequired',
      [context.getHandler(), context.getClass()],
    );
    if (isSuperAdminRequired) {
      throw new ForbiddenException('Permisos insuficientes');
    }

    // 6. Verificar que el usuario tiene TODOS los permisos requeridos (AND)
    const userPermissions: string[] = user.permissions ?? [];
    const hasAll = requiredPermissions.every((p) =>
      userPermissions.includes(p),
    );

    if (!hasAll) {
      throw new ForbiddenException('Permisos insuficientes');
    }

    return true;
  }
}
