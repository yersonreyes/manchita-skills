import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { UserDto } from '@core/services/userService/user.res.dto';
import { UserService } from '@core/services/userService/user.service';
import { ProjectMemberRole, ProjectStatus, UpdateProjectReqDto, UpsertMemberReqDto } from '@core/services/projectService/project.req.dto';
import { ProjectMemberDto, ProjectResDto } from '@core/services/projectService/project.res.dto';
import { ProjectService } from '@core/services/projectService/project.service';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { HasPermissionDirective } from '@shared/directives/has-permission.directive';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Checkbox } from 'primeng/checkbox';
import { DatePicker } from 'primeng/datepicker';
import { Dialog } from 'primeng/dialog';
import { Drawer } from 'primeng/drawer';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Textarea } from 'primeng/textarea';
import { Tooltip } from 'primeng/tooltip';

interface SelectOption<T> {
  label: string;
  value: T;
}

@Component({
  selector: 'app-project-management',
  standalone: true,
  imports: [
    FormsModule,
    TableModule,
    Button,
    Dialog,
    Drawer,
    InputText,
    InputNumber,
    Select,
    Tag,
    Card,
    Tooltip,
    Checkbox,

    DatePicker,
    Textarea,
    HasPermissionDirective,
    PageHeaderComponent,
  ],
  templateUrl: './project-management.html',
  styleUrl: './project-management.sass',
})
export class ProjectManagement implements OnInit {
  private readonly projectService = inject(ProjectService);
  private readonly userService = inject(UserService);
  private readonly uiDialog = inject(UiDialogService);
  private readonly router = inject(Router);

  // ─── Estado de la página ──────────────────────────────────────────────────
  projects = signal<ProjectResDto[]>([]);
  allUsers = signal<UserDto[]>([]);
  loading = signal(false);

  // ─── Estado del wizard ────────────────────────────────────────────────────
  dialogVisible = signal(false);
  wizardStep = signal<1 | 2>(1);
  createdProjectId = signal<number | null>(null);
  wizardMembers = signal<ProjectMemberDto[]>([]);
  editingProject = signal<ProjectResDto | null>(null);

  // ─── Diálogo de miembros ──────────────────────────────────────────────────
  membersDialogVisible = signal(false);
  managingProject = signal<ProjectResDto | null>(null);

  // ─── Ficha de miembro ─────────────────────────────────────────────────────
  fichaDrawerVisible = signal(false);
  fichaProjectId = signal<number | null>(null);
  fichaUserId = signal<number | null>(null);
  fichaUserNombre = signal('');
  savingFicha = signal(false);
  fichaForm: {
    cargo: string;
    fechaIngreso: Date | null;
    horasSemanalesProyecto: number | null;
    responsabilidades: string[];
    entregables: string[];
    modulosAsignados: string[];
    participaDaily: boolean;
    participaPlanning: boolean;
    participaReview: boolean;
    participaRetro: boolean;
    objetivos: string;
    observaciones: string;
    accesos: { repositorio: string; ambientes: string; herramientas: string; credenciales: string };
  } = {
    cargo: '',
    fechaIngreso: null,
    horasSemanalesProyecto: null,
    responsabilidades: [],
    entregables: [],
    modulosAsignados: [],
    participaDaily: false,
    participaPlanning: false,
    participaReview: false,
    participaRetro: false,
    objetivos: '',
    observaciones: '',
    accesos: { repositorio: '', ambientes: '', herramientas: '', credenciales: '' },
  };

  // ─── Formulario Step 1 ────────────────────────────────────────────────────
  projectForm = {
    nombre: '',
    descripcion: '',
    estado: 'DRAFT' as ProjectStatus,
    activo: true,
  };

  // ─── Formulario Step 2 ────────────────────────────────────────────────────
  selectedUser: UserDto | null = null;
  selectedRole: ProjectMemberRole = 'VIEWER';

  // ─── Opciones de selects ──────────────────────────────────────────────────
  readonly estadoOptions: SelectOption<ProjectStatus>[] = [
    { label: 'Borrador', value: 'DRAFT' },
    { label: 'En Progreso', value: 'IN_PROGRESS' },
    { label: 'Completado', value: 'COMPLETED' },
    { label: 'Archivado', value: 'ARCHIVED' },
  ];

  readonly roleOptions: SelectOption<ProjectMemberRole>[] = [
    { label: 'Propietario', value: 'OWNER' },
    { label: 'Editor', value: 'EDITOR' },
    { label: 'Visualizador', value: 'VIEWER' },
  ];

  // ─── Usuarios disponibles (excluye los ya agregados) ─────────────────────
  availableUsers = computed(() => {
    const addedIds = this.wizardMembers().map((m) => m.user.id);
    return this.allUsers().filter((u) => !addedIds.includes(u.id));
  });

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  ngOnInit(): void {
    void this.loadProjects();
    void this.loadAllUsers();
  }

  async loadProjects(): Promise<void> {
    this.loading.set(true);
    try {
      const projects = await this.projectService.getAll();
      this.projects.set(projects ?? []);
    } catch {
      this.projects.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  async loadAllUsers(): Promise<void> {
    try {
      const users = await this.userService.getAll();
      this.allUsers.set(users);
    } catch {
      // Error manejado por el builder
    }
  }

  // ─── Wizard ───────────────────────────────────────────────────────────────
  openCreateDialog(): void {
    this.editingProject.set(null);
    this.projectForm = { nombre: '', descripcion: '', estado: 'DRAFT', activo: true };
    this.selectedUser = null;
    this.selectedRole = 'VIEWER';
    this.wizardMembers.set([]);
    this.createdProjectId.set(null);
    this.wizardStep.set(1);
    this.dialogVisible.set(true);
  }

  openMembersDialog(project: ProjectResDto): void {
    this.managingProject.set(project);
    this.createdProjectId.set(project.id);
    this.selectedUser = null;
    this.selectedRole = 'VIEWER';
    this.wizardMembers.set([...project.members]);
    this.membersDialogVisible.set(true);
  }

  async closeMembersDialog(): Promise<void> {
    this.membersDialogVisible.set(false);
    this.managingProject.set(null);
    await this.loadProjects();
  }

  openEditDialog(project: ProjectResDto): void {
    this.editingProject.set(project);
    this.projectForm = {
      nombre: project.nombre,
      descripcion: project.descripcion ?? '',
      estado: project.estado,
      activo: project.activo,
    };
    this.selectedUser = null;
    this.selectedRole = 'VIEWER';
    this.wizardMembers.set([...project.members]);
    this.createdProjectId.set(project.id);
    this.wizardStep.set(1);
    this.dialogVisible.set(true);
  }

  async submitStep1(): Promise<void> {
    if (!this.projectForm.nombre.trim()) {
      this.uiDialog.showWarn('Campo requerido', 'El nombre del proyecto es obligatorio');
      return;
    }

    const editing = this.editingProject();

    try {
      if (editing) {
        const dto: UpdateProjectReqDto = {
          nombre: this.projectForm.nombre.trim(),
          descripcion: this.projectForm.descripcion.trim() || null,
          estado: this.projectForm.estado,
          activo: this.projectForm.activo,
        };
        await this.projectService.update(editing.id, dto);
      } else {
        const project = await this.projectService.create({
          nombre: this.projectForm.nombre.trim(),
          descripcion: this.projectForm.descripcion.trim() || null,
          estado: this.projectForm.estado,
          activo: this.projectForm.activo,
        });
        this.createdProjectId.set(project.id);
      }
      this.wizardStep.set(2);
    } catch {
      // Error manejado por el builder
    }
  }

  async addMember(): Promise<void> {
    const user = this.selectedUser;
    const projectId = this.createdProjectId();

    if (!user || !projectId) return;

    const alreadyAdded = this.wizardMembers().some((m) => m.user.id === user.id);
    if (alreadyAdded) {
      this.uiDialog.showWarn('Duplicado', `${user.nombre} ya fue agregado al proyecto`);
      return;
    }

    try {
      await this.projectService.upsertMember(projectId, {
        userId: user.id,
        role: this.selectedRole,
      });
      this.wizardMembers.update((members) => [
        ...members,
        { user: { id: user.id, nombre: user.nombre, email: user.email }, role: this.selectedRole },
      ]);
      this.selectedUser = null;
    } catch {
      // Error manejado por el builder
    }
  }

  async removeMember(userId: number): Promise<void> {
    const projectId = this.createdProjectId();
    if (!projectId) return;

    try {
      await this.projectService.removeMember(projectId, userId);
      this.wizardMembers.update((members) => members.filter((m) => m.user.id !== userId));
    } catch {
      // Error manejado por el builder
    }
  }

  async finishWizard(): Promise<void> {
    const isEditing = !!this.editingProject();
    this.dialogVisible.set(false);
    this.uiDialog.showSuccess(
      isEditing ? 'Proyecto actualizado' : 'Proyecto creado',
      isEditing ? 'Los cambios fueron guardados correctamente' : 'El proyecto fue creado correctamente',
    );
    await this.loadProjects();
  }

  navigateToProject(id: number): void {
    void this.router.navigate(['/platform/projects', id]);
  }

  navigateToTasks(id: number): void {
    void this.router.navigate(['/platform/projects', id, 'tasks']);
  }

  navigateToWiki(id: number): void {
    void this.router.navigate(['/platform/projects', id, 'wiki']);
  }

  navigateToRequirements(id: number): void {
    void this.router.navigate(['/platform/projects', id, 'requirements']);
  }

  // ─── Ficha array helpers ──────────────────────────────────────────────────
  fichaArrayInputs: Record<string, string> = {
    responsabilidades: '', entregables: '', modulosAsignados: '',
  };

  addFichaArrayItem(field: 'responsabilidades' | 'entregables' | 'modulosAsignados'): void {
    const val = this.fichaArrayInputs[field]?.trim();
    if (!val) return;
    if (!this.fichaForm[field].includes(val)) {
      this.fichaForm[field] = [...this.fichaForm[field], val];
    }
    this.fichaArrayInputs[field] = '';
  }

  removeFichaArrayItem(field: 'responsabilidades' | 'entregables' | 'modulosAsignados', item: string): void {
    this.fichaForm[field] = this.fichaForm[field].filter((i) => i !== item);
  }

  // ─── Ficha de miembro ─────────────────────────────────────────────────────
  openFichaDrawer(projectId: number, member: ProjectMemberDto): void {
    this.fichaProjectId.set(projectId);
    this.fichaUserId.set(member.user.id);
    this.fichaUserNombre.set(member.user.nombre);
    this.fichaForm = {
      cargo: member.cargo ?? '',
      fechaIngreso: member.fechaIngreso ? new Date(member.fechaIngreso) : null,
      horasSemanalesProyecto: member.horasSemanalesProyecto ?? null,
      responsabilidades: [...(member.responsabilidades ?? [])],
      entregables: [...(member.entregables ?? [])],
      modulosAsignados: [...(member.modulosAsignados ?? [])],
      participaDaily: member.participaDaily ?? false,
      participaPlanning: member.participaPlanning ?? false,
      participaReview: member.participaReview ?? false,
      participaRetro: member.participaRetro ?? false,
      objetivos: member.objetivos ?? '',
      observaciones: member.observaciones ?? '',
      accesos: {
        repositorio: member.accesos?.['repositorio'] ?? '',
        ambientes: member.accesos?.['ambientes'] ?? '',
        herramientas: member.accesos?.['herramientas'] ?? '',
        credenciales: member.accesos?.['credenciales'] ?? '',
      },
    };
    this.fichaArrayInputs = { responsabilidades: '', entregables: '', modulosAsignados: '' };
    this.fichaDrawerVisible.set(true);
  }

  async saveFicha(): Promise<void> {
    const projectId = this.fichaProjectId();
    const userId = this.fichaUserId();
    if (!projectId || !userId) return;

    this.savingFicha.set(true);
    try {
      // Recuperar rol actual del miembro
      const project = this.managingProject() ?? this.projects().find((p) => p.id === projectId);
      const currentMember = project?.members.find((m) => m.user.id === userId);
      const role: ProjectMemberRole = currentMember?.role ?? 'VIEWER';

      const dto: UpsertMemberReqDto = {
        userId,
        role,
        cargo: this.fichaForm.cargo || undefined,
        fechaIngreso: this.fichaForm.fechaIngreso?.toISOString() ?? undefined,
        horasSemanalesProyecto: this.fichaForm.horasSemanalesProyecto ?? undefined,
        responsabilidades: this.fichaForm.responsabilidades,
        entregables: this.fichaForm.entregables,
        modulosAsignados: this.fichaForm.modulosAsignados,
        participaDaily: this.fichaForm.participaDaily,
        participaPlanning: this.fichaForm.participaPlanning,
        participaReview: this.fichaForm.participaReview,
        participaRetro: this.fichaForm.participaRetro,
        objetivos: this.fichaForm.objetivos || undefined,
        observaciones: this.fichaForm.observaciones || undefined,
        accesos: {
          repositorio: this.fichaForm.accesos.repositorio || undefined,
          ambientes: this.fichaForm.accesos.ambientes || undefined,
          herramientas: this.fichaForm.accesos.herramientas || undefined,
          credenciales: this.fichaForm.accesos.credenciales || undefined,
        },
      };

      await this.projectService.upsertMember(projectId, dto);
      this.uiDialog.showSuccess('Ficha guardada', `La ficha de ${this.fichaUserNombre()} fue actualizada`);
      this.fichaDrawerVisible.set(false);
      await this.loadProjects();
    } catch {
      // Error manejado por el builder
    } finally {
      this.savingFicha.set(false);
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  getEstadoLabel(estado: ProjectStatus): string {
    return this.estadoOptions.find((o) => o.value === estado)?.label ?? estado;
  }

  getEstadoSeverity(estado: ProjectStatus): 'info' | 'success' | 'secondary' | 'warn' {
    const map: Record<ProjectStatus, 'info' | 'success' | 'secondary' | 'warn'> = {
      DRAFT: 'secondary',
      IN_PROGRESS: 'info',
      COMPLETED: 'success',
      ARCHIVED: 'warn',
    };
    return map[estado];
  }

  getRoleLabel(role: ProjectMemberRole): string {
    return this.roleOptions.find((o) => o.value === role)?.label ?? role;
  }
}
