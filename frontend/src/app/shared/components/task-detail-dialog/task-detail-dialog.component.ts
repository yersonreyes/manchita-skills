import { Component, ViewEncapsulation, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskResDto, TaskStatusDto, TaskTagDto } from '@core/services/taskService/task.res.dto';
import { CreateTaskReqDto, TaskPriority, UpdateTaskReqDto } from '@core/services/taskService/task.req.dto';
import { ProjectMemberDto } from '@core/services/projectService/project.res.dto';
import { TaskTagService } from '@core/services/taskTagService/task-tag.service';
import { WikiEditorComponent } from '@pages/platform/wiki/wiki-page/wiki-editor.component';
import { Button } from 'primeng/button';
import { Drawer } from 'primeng/drawer';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { DatePicker } from 'primeng/datepicker';
import { Tooltip } from 'primeng/tooltip';
import { Textarea } from 'primeng/textarea';
import { SelectButton } from 'primeng/selectbutton';
import { AutoComplete } from 'primeng/autocomplete';

interface SelectOption {
  label: string;
  value: number | string | null;
}

interface FormState {
  titulo: string;
  descripcion: string;
  statusId: number | null;
  prioridad: TaskPriority;
  assigneeId: number | null;
  fechaInicio: Date | null;
  fechaVencimiento: Date | null;
  estimacion: number | null;
  parentId: number | null;
  toolApplicationId: number | null;
  tagIds: number[];
}

// Tag extended with creation flag
export interface TagOption extends TaskTagDto {
  isNew?: boolean;
}

const TAG_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
  '#06B6D4', '#84CC16',
];

@Component({
  selector: 'app-task-detail-dialog',
  standalone: true,
  imports: [
    FormsModule,
    Button,
    Drawer,
    Select,
    InputText,
    InputNumber,
    DatePicker,
    Tooltip,
    Textarea,
    SelectButton,
    AutoComplete,
    WikiEditorComponent,
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './task-detail-dialog.component.html',
  styleUrl: './task-detail-dialog.component.sass',
})
export class TaskDetailDialogComponent {
  private readonly tagService = inject(TaskTagService);

  visible = input(false);
  task = input<TaskResDto | null>(null);
  statuses = input<TaskStatusDto[]>([]);
  tags = input<TaskTagDto[]>([]);
  members = input<ProjectMemberDto[]>([]);
  tasks = input<TaskResDto[]>([]);
  defaultStatusId = input<number | null>(null);
  projectId = input<number>(0);

  visibleChange = output<boolean>();
  save = output<CreateTaskReqDto | UpdateTaskReqDto>();
  autosave = output<UpdateTaskReqDto>();
  delete = output<number>();
  tagCreated = output<TaskTagDto>();

  form: FormState = this.emptyForm();
  showDeleteConfirm = false;
  descriptionMode = signal<'visual' | 'raw'>('visual');
  private autoSaveTimer: ReturnType<typeof setTimeout> | null = null;

  // Tag autocomplete state
  selectedTagObjects: TagOption[] = [];
  tagSuggestions: TagOption[] = [];
  creatingTag = false;

  readonly descriptionModeOptions = [
    { label: 'Visual', value: 'visual', icon: 'pi pi-eye' },
    { label: 'Markdown', value: 'raw', icon: 'pi pi-code' },
  ];

  readonly priorityOptions: SelectOption[] = [
    { label: 'Urgente', value: 'URGENT' },
    { label: 'Alta', value: 'HIGH' },
    { label: 'Media', value: 'MEDIUM' },
    { label: 'Baja', value: 'LOW' },
  ];

  constructor() {
    effect(() => {
      const isVisible = this.visible();
      const statuses = this.statuses();
      const t = this.task();
      const defaultStatus = this.defaultStatusId();

      if (!isVisible) return;

      if (t) {
        this.form = {
          titulo: t.titulo,
          descripcion: t.descripcion ?? '',
          statusId: t.statusId,
          prioridad: t.prioridad,
          assigneeId: t.assigneeId,
          fechaInicio: t.fechaInicio ? new Date(t.fechaInicio) : null,
          fechaVencimiento: t.fechaVencimiento ? new Date(t.fechaVencimiento) : null,
          estimacion: t.estimacion,
          parentId: t.parentId,
          toolApplicationId: t.toolApplicationId,
          tagIds: t.tags.map((tg) => tg.tagId),
        };
        this.selectedTagObjects = t.tags.map((tg) => tg.tag);
      } else {
        this.form = this.emptyForm();
        this.selectedTagObjects = [];
        if (defaultStatus) {
          this.form.statusId = defaultStatus;
        } else if (statuses.length > 0) {
          this.form.statusId = statuses[0].id;
        }
      }
      this.showDeleteConfirm = false;
      this.descriptionMode.set('visual');
    });
  }

  get isEdit(): boolean {
    return !!this.task();
  }

  get statusOptions(): SelectOption[] {
    return this.statuses().map((s) => ({ label: s.nombre, value: s.id }));
  }

  get memberOptions(): SelectOption[] {
    const roleLabel: Record<string, string> = {
      OWNER: 'Dueño',
      EDITOR: 'Editor',
      VIEWER: 'Lector',
    };
    return [
      { label: 'Sin asignar', value: null },
      ...this.members().map((m) => ({
        label: `${m.user.nombre} · ${roleLabel[m.role] ?? m.role}`,
        value: m.user.id,
      })),
    ];
  }

  get parentOptions(): SelectOption[] {
    const current = this.task();
    return [
      { label: 'Sin tarea padre', value: null },
      ...this.tasks()
        .filter((t) => !current || t.id !== current.id)
        .map((t) => ({ label: t.titulo, value: t.id })),
    ];
  }

  // ─── Tag autocomplete ─────────────────────────────────────────────────────

  filterTags(event: { query: string }): void {
    const q = event.query.trim().toLowerCase();
    const selectedIds = new Set(this.selectedTagObjects.map((t) => t.id));

    const available = this.tags().filter(
      (t) => t.nombre.toLowerCase().includes(q) && !selectedIds.has(t.id),
    );

    if (!q) {
      this.tagSuggestions = available;
      return;
    }

    const exactMatch = this.tags().find((t) => t.nombre.toLowerCase() === q);
    if (exactMatch && !selectedIds.has(exactMatch.id)) {
      this.tagSuggestions = available;
    } else if (!exactMatch) {
      // Add "create new" option at the bottom
      const createOption: TagOption = {
        id: -1,
        projectId: this.projectId(),
        nombre: event.query.trim(),
        color: '',
        isNew: true,
      };
      this.tagSuggestions = [...available, createOption];
    } else {
      this.tagSuggestions = available;
    }
  }

  async onTagSelect(event: any): Promise<void> {
    const tag: TagOption = event.value ?? event;
    if (!tag.isNew) {
      this.syncTagIds();
      return;
    }

    // Remove the "new" placeholder from selection while creating
    this.selectedTagObjects = this.selectedTagObjects.filter((t) => !t.isNew);
    this.creatingTag = true;

    try {
      const newTag = await this.tagService.create({
        projectId: this.projectId(),
        nombre: tag.nombre,
        color: this.randomColor(),
      });
      this.selectedTagObjects = [...this.selectedTagObjects, newTag];
      this.tagCreated.emit(newTag);
    } finally {
      this.creatingTag = false;
    }
    this.syncTagIds();
    this.scheduleAutoSave();
  }

  onTagUnselect(): void {
    this.syncTagIds();
    this.scheduleAutoSave();
  }

  private syncTagIds(): void {
    this.form.tagIds = this.selectedTagObjects
      .filter((t) => t.id > 0)
      .map((t) => t.id);
  }

  private randomColor(): string {
    return TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
  }

  // ─── Auto-save ────────────────────────────────────────────────────────────

  scheduleAutoSave(): void {
    if (!this.isEdit) return;
    if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
    this.autoSaveTimer = setTimeout(() => this.flushAutoSave(), 800);
  }

  onDescriptionChange(value: string): void {
    this.form.descripcion = value;
    this.scheduleAutoSave();
  }

  private flushAutoSave(): void {
    if (!this.isEdit || !this.form.titulo.trim() || !this.form.statusId) return;
    const toIso = (d: Date | null) => (d ? d.toISOString() : null);
    const dto: UpdateTaskReqDto = {
      titulo: this.form.titulo.trim(),
      descripcion: this.form.descripcion.trim() || null,
      statusId: this.form.statusId!,
      prioridad: this.form.prioridad,
      assigneeId: this.form.assigneeId,
      toolApplicationId: this.form.toolApplicationId,
      fechaInicio: toIso(this.form.fechaInicio),
      fechaVencimiento: toIso(this.form.fechaVencimiento),
      estimacion: this.form.estimacion,
      tagIds: this.form.tagIds,
    };
    this.autosave.emit(dto);
  }

  // ─── Form ─────────────────────────────────────────────────────────────────

  private emptyForm(): FormState {
    return {
      titulo: '',
      descripcion: '',
      statusId: null,
      prioridad: 'MEDIUM',
      assigneeId: null,
      fechaInicio: null,
      fechaVencimiento: null,
      estimacion: null,
      parentId: null,
      toolApplicationId: null,
      tagIds: [],
    };
  }

  onHide(): void {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
    this.visibleChange.emit(false);
  }

  onSubmit(): void {
    if (!this.form.titulo.trim() || !this.form.statusId) return;

    const toIso = (d: Date | null) => (d ? d.toISOString() : null);

    if (this.isEdit) {
      const dto: UpdateTaskReqDto = {
        titulo: this.form.titulo.trim(),
        descripcion: this.form.descripcion.trim() || null,
        statusId: this.form.statusId!,
        prioridad: this.form.prioridad,
        assigneeId: this.form.assigneeId,
        toolApplicationId: this.form.toolApplicationId,
        fechaInicio: toIso(this.form.fechaInicio),
        fechaVencimiento: toIso(this.form.fechaVencimiento),
        estimacion: this.form.estimacion,
        tagIds: this.form.tagIds,
      };
      this.save.emit(dto);
    } else {
      const dto: CreateTaskReqDto = {
        projectId: 0,
        titulo: this.form.titulo.trim(),
        descripcion: this.form.descripcion.trim() || undefined,
        statusId: this.form.statusId!,
        prioridad: this.form.prioridad,
        assigneeId: this.form.assigneeId ?? undefined,
        parentId: this.form.parentId ?? undefined,
        toolApplicationId: this.form.toolApplicationId ?? undefined,
        fechaInicio: toIso(this.form.fechaInicio) ?? undefined,
        fechaVencimiento: toIso(this.form.fechaVencimiento) ?? undefined,
        estimacion: this.form.estimacion ?? undefined,
        tagIds: this.form.tagIds,
      };
      this.save.emit(dto);
    }
  }

  confirmDelete(): void {
    this.showDeleteConfirm = true;
  }

  onDelete(): void {
    const t = this.task();
    if (t) this.delete.emit(t.id);
    this.showDeleteConfirm = false;
  }
}
