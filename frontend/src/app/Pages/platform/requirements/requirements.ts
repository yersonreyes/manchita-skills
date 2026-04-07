import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { PermissionCheckService } from '@core/services/common/permission-check.service';
import {
  ChangeRequirementStatusReqDto,
  CreateRequirementReqDto,
  RequirementPriority,
  RequirementStatus,
  RequirementSubtype,
  RequirementType,
  UpdateRequirementReqDto,
} from '@core/services/requirementService/requirement.req.dto';
import { RequirementResDto } from '@core/services/requirementService/requirement.res.dto';
import { RequirementService } from '@core/services/requirementService/requirement.service';
import { HasPermissionDirective } from '@shared/directives/has-permission.directive';
import { Button } from 'primeng/button';
import { Drawer } from 'primeng/drawer';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { Tooltip } from 'primeng/tooltip';

interface SelectOption<T = string> {
  label: string;
  value: T;
}

type DrawerMode = 'create-fr' | 'create-nfr' | 'edit';

@Component({
  selector: 'app-requirements',
  standalone: true,
  imports: [
    FormsModule,
    Button,
    Drawer,
    InputText,
    Select,
    Textarea,
    Tooltip,
    HasPermissionDirective,
  ],
  templateUrl: './requirements.html',
  styleUrl: './requirements.sass',
})
export class RequirementsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly requirementService = inject(RequirementService);
  private readonly uiDialog = inject(UiDialogService);
  private readonly permissionCheck = inject(PermissionCheckService);

  canChangeStatus = this.permissionCheck.hasPermission$('requirements:status');

  projectId = signal<number>(0);

  allRequirements = signal<RequirementResDto[]>([]);
  loading = signal(false);
  saving = signal(false);

  // ─── Drawer ───────────────────────────────────────────────────────────────
  drawerVisible = signal(false);
  drawerMode = signal<DrawerMode>('create-fr');
  editingId = signal<number | null>(null);

  // ─── Computed lists ───────────────────────────────────────────────────────
  functionals = computed(() => this.allRequirements().filter((r) => r.type === 'FUNCTIONAL'));
  nonFunctionals = computed(() => this.allRequirements().filter((r) => r.type === 'NON_FUNCTIONAL'));

  activeTab = signal(0);
  activeList = computed(() => this.activeTab() === 0 ? this.functionals() : this.nonFunctionals());
  validatedCount = computed(() => this.allRequirements().filter((r) => r.status === 'VALIDATED').length);
  inReviewCount = computed(() => this.allRequirements().filter((r) => r.status === 'IN_REVIEW').length);

  // ─── Formulario ───────────────────────────────────────────────────────────
  form: {
    title: string;
    description: string;
    userStory: string;
    acceptanceCriteria: string[];
    subtype: RequirementSubtype | null;
    priority: RequirementPriority;
    source: string;
    businessValue: string;
    status: RequirementStatus;
  } = this.emptyForm();

  criteriaInput = '';

  // ─── Opciones ─────────────────────────────────────────────────────────────
  readonly priorityOptions: SelectOption<RequirementPriority>[] = [
    { label: 'Imprescindible', value: 'MUST_HAVE' },
    { label: 'Importante', value: 'SHOULD_HAVE' },
    { label: 'Deseable', value: 'COULD_HAVE' },
    { label: 'Postergado', value: 'WONT_HAVE' },
  ];

  readonly statusOptions: SelectOption<RequirementStatus>[] = [
    { label: 'Borrador', value: 'DRAFT' },
    { label: 'En revisión', value: 'IN_REVIEW' },
    { label: 'Validado', value: 'VALIDATED' },
    { label: 'Rechazado', value: 'REJECTED' },
    { label: 'Diferido', value: 'DEFERRED' },
  ];

  readonly subtypeOptions: SelectOption<RequirementSubtype>[] = [
    { label: 'Performance', value: 'PERFORMANCE' },
    { label: 'Seguridad', value: 'SECURITY' },
    { label: 'Usabilidad', value: 'USABILITY' },
    { label: 'Escalabilidad', value: 'SCALABILITY' },
    { label: 'Confiabilidad', value: 'RELIABILITY' },
    { label: 'Disponibilidad', value: 'AVAILABILITY' },
    { label: 'Mantenibilidad', value: 'MAINTAINABILITY' },
    { label: 'Compatibilidad', value: 'COMPATIBILITY' },
  ];

  async ngOnInit() {
    this.projectId.set(Number(this.route.snapshot.params['id']));
    await this.loadRequirements();
  }

  async loadRequirements() {
    this.loading.set(true);
    try {
      const data = await this.requirementService.getByProject(this.projectId());
      this.allRequirements.set(data);
    } finally {
      this.loading.set(false);
    }
  }

  // ─── Drawer ───────────────────────────────────────────────────────────────

  openCreateFR() {
    this.form = this.emptyForm();
    this.criteriaInput = '';
    this.editingId.set(null);
    this.drawerMode.set('create-fr');
    this.drawerVisible.set(true);
  }

  openCreateNFR() {
    this.form = this.emptyForm();
    this.criteriaInput = '';
    this.editingId.set(null);
    this.drawerMode.set('create-nfr');
    this.drawerVisible.set(true);
  }

  openEdit(req: RequirementResDto) {
    this.form = {
      title: req.title,
      description: req.description,
      userStory: req.userStory ?? '',
      acceptanceCriteria: [...req.acceptanceCriteria],
      subtype: req.subtype,
      priority: req.priority,
      source: req.source ?? '',
      businessValue: req.businessValue ?? '',
      status: req.status,
    };
    this.criteriaInput = '';
    this.editingId.set(req.id);
    this.drawerMode.set('edit');
    this.drawerVisible.set(true);
  }

  async save() {
    if (!this.form.title || !this.form.description) {
      this.uiDialog.showError('Completá el título y la descripción');
      return;
    }

    const mode = this.drawerMode();
    if ((mode === 'create-nfr') && !this.form.subtype) {
      this.uiDialog.showError('Seleccioná el subtipo del requisito');
      return;
    }

    this.saving.set(true);
    try {
      const editId = this.editingId();
      if (mode === 'edit' && editId) {
        const dto: UpdateRequirementReqDto = {
          title: this.form.title,
          description: this.form.description,
          userStory: this.form.userStory || undefined,
          acceptanceCriteria: this.form.acceptanceCriteria,
          subtype: this.form.subtype ?? undefined,
          priority: this.form.priority,
          source: this.form.source || undefined,
          businessValue: this.form.businessValue || undefined,
        };
        const updated = await this.requirementService.update(this.projectId(), editId, dto);
        this.allRequirements.update((list) => list.map((r) => (r.id === editId ? updated : r)));
        this.uiDialog.showSuccess('Requisito actualizado');
      } else {
        const type: RequirementType = mode === 'create-fr' ? 'FUNCTIONAL' : 'NON_FUNCTIONAL';
        const dto: CreateRequirementReqDto = {
          type,
          title: this.form.title,
          description: this.form.description,
          userStory: this.form.userStory || undefined,
          acceptanceCriteria: this.form.acceptanceCriteria,
          subtype: this.form.subtype ?? undefined,
          priority: this.form.priority,
          source: this.form.source || undefined,
          businessValue: this.form.businessValue || undefined,
        };
        const created = await this.requirementService.create(this.projectId(), dto);
        this.allRequirements.update((list) => [...list, created]);
        this.uiDialog.showSuccess('Requisito creado');
      }
      this.drawerVisible.set(false);
    } catch {
      this.uiDialog.showError('Error al guardar el requisito');
    } finally {
      this.saving.set(false);
    }
  }

  async changeStatus(req: RequirementResDto, status: RequirementStatus) {
    const dto: ChangeRequirementStatusReqDto = { status };
    try {
      const updated = await this.requirementService.changeStatus(this.projectId(), req.id, dto);
      this.allRequirements.update((list) => list.map((r) => (r.id === req.id ? updated : r)));
    } catch {
      this.uiDialog.showError('No tenés permiso para cambiar el estado');
    }
  }

  async confirmDelete(req: RequirementResDto) {
    const confirmed = await this.uiDialog.confirm({
      header: '¿Eliminar requisito?',
      message: `"${req.title}" será eliminado permanentemente.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
    });
    if (!confirmed) return;
    try {
      await this.requirementService.delete(this.projectId(), req.id);
      this.allRequirements.update((list) => list.filter((r) => r.id !== req.id));
      this.uiDialog.showSuccess('Requisito eliminado');
    } catch {
      this.uiDialog.showError('Error al eliminar el requisito');
    }
  }

  // ─── Criterios de aceptación ──────────────────────────────────────────────

  addCriteria() {
    const val = this.criteriaInput.trim();
    if (val) {
      this.form.acceptanceCriteria = [...this.form.acceptanceCriteria, val];
      this.criteriaInput = '';
    }
  }

  removeCriteria(item: string) {
    this.form.acceptanceCriteria = this.form.acceptanceCriteria.filter((c) => c !== item);
  }

  // ─── Helpers de UI ────────────────────────────────────────────────────────

  getPrioritySeverity(priority: RequirementPriority): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const map: Record<RequirementPriority, 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'> = {
      MUST_HAVE: 'danger',
      SHOULD_HAVE: 'warn',
      COULD_HAVE: 'info',
      WONT_HAVE: 'secondary',
    };
    return map[priority];
  }

  getPriorityLabel(priority: RequirementPriority): string {
    const map: Record<RequirementPriority, string> = {
      MUST_HAVE: 'Imprescindible',
      SHOULD_HAVE: 'Importante',
      COULD_HAVE: 'Deseable',
      WONT_HAVE: 'Postergado',
    };
    return map[priority];
  }

  getStatusSeverity(status: RequirementStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const map: Record<RequirementStatus, 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'> = {
      DRAFT: 'secondary',
      IN_REVIEW: 'warn',
      VALIDATED: 'success',
      REJECTED: 'danger',
      DEFERRED: 'info',
    };
    return map[status];
  }

  getStatusLabel(status: RequirementStatus): string {
    const map: Record<RequirementStatus, string> = {
      DRAFT: 'Borrador',
      IN_REVIEW: 'En revisión',
      VALIDATED: 'Validado',
      REJECTED: 'Rechazado',
      DEFERRED: 'Diferido',
    };
    return map[status];
  }

  getSubtypeLabel(subtype: RequirementSubtype | null): string {
    if (!subtype) return '—';
    const map: Record<RequirementSubtype, string> = {
      PERFORMANCE: 'Performance',
      SECURITY: 'Seguridad',
      USABILITY: 'Usabilidad',
      SCALABILITY: 'Escalabilidad',
      RELIABILITY: 'Confiabilidad',
      AVAILABILITY: 'Disponibilidad',
      MAINTAINABILITY: 'Mantenibilidad',
      COMPATIBILITY: 'Compatibilidad',
    };
    return map[subtype];
  }

  get drawerTitle(): string {
    const mode = this.drawerMode();
    if (mode === 'edit') return 'Editar Requisito';
    if (mode === 'create-fr') return 'Nuevo Requisito Funcional';
    return 'Nuevo Requisito No Funcional';
  }

  isFunctionalMode(): boolean {
    const mode = this.drawerMode();
    if (mode === 'create-fr') return true;
    if (mode === 'create-nfr') return false;
    const id = this.editingId();
    if (!id) return true;
    return this.allRequirements().find((r) => r.id === id)?.type === 'FUNCTIONAL';
  }

  editingRequirementType(type: string): boolean {
    const id = this.editingId();
    if (!id) return false;
    return (this.allRequirements().find((r) => r.id === id)?.type ?? '') === type;
  }

  private emptyForm() {
    return {
      title: '',
      description: '',
      userStory: '',
      acceptanceCriteria: [] as string[],
      subtype: null as RequirementSubtype | null,
      priority: 'MUST_HAVE' as RequirementPriority,
      source: '',
      businessValue: '',
      status: 'DRAFT' as RequirementStatus,
    };
  }
}
