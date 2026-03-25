import { Injectable, Signal, computed } from '@angular/core';
import { AuthService } from '../authService/auth.service';

@Injectable({ providedIn: 'root' })
export class PermissionCheckService {
  constructor(private readonly authService: AuthService) {}

  get permissions(): Signal<string[]> {
    return this.authService.userPermissions;
  }

  hasPermission(permission: string): boolean {
    if (this.authService.isSuperAdmin()) return true;
    return this.authService.userPermissions().includes(permission);
  }

  hasAllPermissions(permissions: string[]): boolean {
    if (!permissions || permissions.length === 0) return true;
    if (this.authService.isSuperAdmin()) return true;
    const userPerms = this.authService.userPermissions();
    return permissions.every((p) => userPerms.includes(p));
  }

  hasAnyPermission(permissions: string[]): boolean {
    if (!permissions || permissions.length === 0) return true;
    if (this.authService.isSuperAdmin()) return true;
    const userPerms = this.authService.userPermissions();
    return permissions.some((p) => userPerms.includes(p));
  }

  // Signals computados para templates reactivos
  hasPermission$(permission: string): Signal<boolean> {
    return computed(() => {
      if (this.authService.isSuperAdmin()) return true;
      return this.authService.userPermissions().includes(permission);
    });
  }

  hasAllPermissions$(permissions: string[]): Signal<boolean> {
    return computed(() => {
      if (this.authService.isSuperAdmin()) return true;
      const userPerms = this.authService.userPermissions();
      return permissions.every((p) => userPerms.includes(p));
    });
  }
}
