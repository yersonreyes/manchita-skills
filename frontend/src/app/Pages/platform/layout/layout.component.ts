import { Component, OnInit, effect, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '@core/services/authService/auth.service';
import { PermissionCheckService } from '@core/services/common/permission-check.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { Avatar } from 'primeng/avatar';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Popover } from 'primeng/popover';
import { Tooltip } from 'primeng/tooltip';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  permission?: string;
}

@Component({
  selector: 'app-platform-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    Button,
    Avatar,
    Tooltip,
    Dialog,
    Popover,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.sass',
})
export class PlatformLayoutComponent implements OnInit {
  sidebarCollapsed = signal(false);
  sessionExpiredVisible = signal(false);

  readonly user = this.authService.user;

  readonly menuItems: MenuItem[] = [
    {
      label: 'Gestión de Usuarios',
      icon: 'pi pi-users',
      route: '/platform/userManagement',
      permission: 'users:read',
    },
    {
      label: 'Gestión de Roles',
      icon: 'pi pi-shield',
      route: '/platform/roleManagement',
      permission: 'permissions:read',
    },
    {
      label: 'Gestión de Proyectos',
      icon: 'pi pi-folder',
      route: '/platform/projects',
      permission: 'projects:read',
    },
    {
      label: 'Mi Perfil',
      icon: 'pi pi-user',
      route: '/platform/profile',
    },
  ];

  constructor(
    readonly authService: AuthService,
    private readonly router: Router,
    private readonly uiDialog: UiDialogService,
    readonly permissionService: PermissionCheckService,
  ) {
    // Escuchar expiración de sesión
    effect(() => {
      if (this.authService.sessionExpired()) {
        this.sessionExpiredVisible.set(true);
      }
    });
  }

  ngOnInit(): void {}

  isMenuItemVisible(item: MenuItem): boolean {
    if (!item.permission) return true;
    return this.permissionService.hasPermission(item.permission);
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update((v) => !v);
  }

  logout(): void {
    this.authService.logout();
  }

  async onSessionExpiredLogin(): Promise<void> {
    this.sessionExpiredVisible.set(false);
    this.authService.logout();
    await this.router.navigate(['/auth/login']);
  }
}
