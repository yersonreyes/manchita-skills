import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PermissionCheckService } from '@core/services/common/permission-check.service';
import { PermissionService } from '@core/services/permissionService/permission.service';
import { RoleDto } from '@core/services/permissionService/permission.res.dto';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { CreateUserRequest, UpdateUserRequest } from '@core/services/userService/user.req.dto';
import { UserDto } from '@core/services/userService/user.res.dto';
import { UserService } from '@core/services/userService/user.service';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { HasPermissionDirective } from '@shared/directives/has-permission.directive';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Checkbox } from 'primeng/checkbox';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    FormsModule,
    TableModule,
    Button,
    Dialog,
    InputText,
    Password,
    Tag,
    Card,
    Tooltip,
    Checkbox,
    HasPermissionDirective,
    PageHeaderComponent,
  ],
  templateUrl: './user-management.html',
  styleUrl: './user-management.sass',
})
export class UserManagement implements OnInit {
  users = signal<UserDto[]>([]);
  roles = signal<RoleDto[]>([]);
  loading = signal(false);

  // Estado del diálogo de crear/editar
  dialogVisible = signal(false);
  editingUser = signal<UserDto | null>(null);
  form = {
    nombre: '',
    email: '',
    password: '',
    activo: true,
  };

  // Estado del diálogo de roles
  rolesDialogVisible = signal(false);
  selectedUser = signal<UserDto | null>(null);
  selectedRoleIds = signal<number[]>([]);

  constructor(
    private readonly userService: UserService,
    private readonly permissionService: PermissionService,
    readonly permissionCheck: PermissionCheckService,
    private readonly uiDialog: UiDialogService,
  ) {}

  ngOnInit(): void {
    void this.loadUsers();
    void this.loadRoles();
  }

  async loadUsers(): Promise<void> {
    this.loading.set(true);
    try {
      const users = await this.userService.getAll();
      this.users.set(users);
    } catch {
      // Error manejado por el builder
    } finally {
      this.loading.set(false);
    }
  }

  async loadRoles(): Promise<void> {
    try {
      const roles = await this.permissionService.getAllRoles();
      this.roles.set(roles);
    } catch {
      // Error manejado por el builder
    }
  }

  openCreate(): void {
    this.editingUser.set(null);
    this.form = { nombre: '', email: '', password: '', activo: true };
    this.dialogVisible.set(true);
  }

  openEdit(user: UserDto): void {
    this.editingUser.set(user);
    this.form = { nombre: user.nombre, email: user.email, password: '', activo: user.activo };
    this.dialogVisible.set(true);
  }

  async saveUser(): Promise<void> {
    if (!this.form.nombre || !this.form.email) {
      this.uiDialog.showWarn('Campos requeridos', 'Nombre y correo son obligatorios');
      return;
    }

    const editing = this.editingUser();
    try {
      if (editing) {
        const dto: UpdateUserRequest = {
          nombre: this.form.nombre,
          email: this.form.email,
          activo: this.form.activo,
        };
        if (this.form.password) dto.password = this.form.password;
        await this.userService.update(editing.id, dto);
        this.uiDialog.showSuccess('Actualizado', 'Usuario actualizado correctamente');
      } else {
        if (!this.form.password || this.form.password.length < 6) {
          this.uiDialog.showWarn('Error', 'La contraseña debe tener al menos 6 caracteres');
          return;
        }
        const dto: CreateUserRequest = {
          nombre: this.form.nombre,
          email: this.form.email,
          password: this.form.password,
          activo: this.form.activo,
        };
        await this.userService.create(dto);
        this.uiDialog.showSuccess('Creado', 'Usuario creado correctamente');
      }
      this.dialogVisible.set(false);
      await this.loadUsers();
    } catch {
      // Error manejado por el builder
    }
  }

  openRolesDialog(user: UserDto): void {
    this.selectedUser.set(user);
    const currentRoleIds = user.userRoles?.map((ur) => ur.role.id) ?? [];
    this.selectedRoleIds.set(currentRoleIds);
    this.rolesDialogVisible.set(true);
  }

  async saveRoles(): Promise<void> {
    const user = this.selectedUser();
    if (!user) return;

    try {
      await this.userService.assignRoles(user.id, { roleIds: this.selectedRoleIds() });
      this.uiDialog.showSuccess('Roles actualizados', 'Los roles fueron asignados correctamente');
      this.rolesDialogVisible.set(false);
      await this.loadUsers();
    } catch {
      // Error manejado por el builder
    }
  }

  async toggleActive(user: UserDto): Promise<void> {
    const msg = user.activo
      ? `¿Desactivar al usuario ${user.nombre}?`
      : `¿Activar al usuario ${user.nombre}?`;

    const confirmed = await this.uiDialog.confirm({ message: msg });
    if (!confirmed) return;

    try {
      await this.userService.update(user.id, { activo: !user.activo });
      this.uiDialog.showSuccess('Actualizado', 'Estado del usuario actualizado');
      await this.loadUsers();
    } catch {
      // Error manejado por el builder
    }
  }

  isRoleSelected(roleId: number): boolean {
    return this.selectedRoleIds().includes(roleId);
  }

  toggleRole(roleId: number): void {
    const current = this.selectedRoleIds();
    if (current.includes(roleId)) {
      this.selectedRoleIds.set(current.filter((id) => id !== roleId));
    } else {
      this.selectedRoleIds.set([...current, roleId]);
    }
  }

  getUserRolesLabel(user: UserDto): string {
    return user.userRoles?.map((ur) => ur.role.nombre).join(', ') || '—';
  }
}
