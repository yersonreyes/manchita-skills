import { Component, OnInit, computed, effect, signal } from '@angular/core';
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

interface MenuGroup {
  label: string;
  items: MenuItem[];
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

  readonly menuGroups: MenuGroup[] = [
    {
      label: 'Administración',
      items: [
        { label: 'Gestión de Usuarios', icon: 'pi pi-users', route: '/platform/userManagement', permission: 'users:read' },
        { label: 'Gestión de Roles', icon: 'pi pi-shield', route: '/platform/roleManagement', permission: 'permissions:read' },
      ],
    },
    {
      label: 'Plataforma',
      items: [
        { label: 'Gestión de Proyectos', icon: 'pi pi-folder', route: '/platform/projects', permission: 'projects:read' },
      ],
    },
    {
      label: 'Mi Cuenta',
      items: [
        { label: 'Mi Perfil', icon: 'pi pi-user', route: '/platform/profile' },
      ],
    },
  ];

  readonly visibleMenuGroups = computed(() => {
    void this.authService.user(); // dependency: recompute when user changes
    return this.menuGroups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) => !item.permission || this.permissionService.hasPermission(item.permission),
        ),
      }))
      .filter((group) => group.items.length > 0);
  });

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
