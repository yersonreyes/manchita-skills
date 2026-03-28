import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PermissionDto, RoleDto } from '@core/services/permissionService/permission.res.dto';
import { PermissionService } from '@core/services/permissionService/permission.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { HasPermissionDirective } from '@shared/directives/has-permission.directive';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Checkbox } from 'primeng/checkbox';
import { Dialog } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [
    TableModule,
    Button,
    Dialog,
    Tag,
    Card,
    Tooltip,
    Checkbox,
    FormsModule,
    HasPermissionDirective,
    PageHeaderComponent,
  ],
  templateUrl: './role-management.html',
  styleUrl: './role-management.sass',
})
export class RoleManagement implements OnInit {
  private readonly permissionService = inject(PermissionService);
  private readonly uiDialog = inject(UiDialogService);

  roles = signal<RoleDto[]>([]);
  allPermissions = signal<PermissionDto[]>([]);
  loading = signal(false);

  // Diálogo de edición de permisos
  permissionsDialogVisible = signal(false);
  selectedRole = signal<RoleDto | null>(null);
  selectedPermissionIds = signal<number[]>([]);

  ngOnInit(): void {
    void this.loadData();
  }

  async loadData(): Promise<void> {
    this.loading.set(true);
    try {
      const [roles, permissions] = await Promise.all([
        this.permissionService.getAllRoles(),
        this.permissionService.getAllPermissions(),
      ]);
      this.roles.set(roles);
      this.allPermissions.set(permissions);
    } catch {
      // Error manejado por el builder
    } finally {
      this.loading.set(false);
    }
  }

  openPermissionsDialog(role: RoleDto): void {
    this.selectedRole.set(role);
    const currentIds = role.permissions?.map((p) => p.id) ?? [];
    this.selectedPermissionIds.set(currentIds);
    this.permissionsDialogVisible.set(true);
  }

  isPermissionSelected(permId: number): boolean {
    return this.selectedPermissionIds().includes(permId);
  }

  togglePermission(permId: number): void {
    const current = this.selectedPermissionIds();
    if (current.includes(permId)) {
      this.selectedPermissionIds.set(current.filter((id) => id !== permId));
    } else {
      this.selectedPermissionIds.set([...current, permId]);
    }
  }

  async savePermissions(): Promise<void> {
    const role = this.selectedRole();
    if (!role) return;

    try {
      await this.permissionService.updateRolePermissions({
        roleId: role.id,
        permissionIds: this.selectedPermissionIds(),
      });
      this.uiDialog.showSuccess('Permisos actualizados', 'Los permisos del rol fueron actualizados');
      this.permissionsDialogVisible.set(false);
      await this.loadData();
    } catch {
      // Error manejado por el builder
    }
  }

  getRolePermissionsLabel(role: RoleDto): string {
    if (!role.permissions || role.permissions.length === 0) return 'Sin permisos';
    return role.permissions.map((p) => p.codigo).join(', ');
  }
}
