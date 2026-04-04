import { Component, ViewEncapsulation, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskResDto, TaskStatusDto, TaskTagDto } from '@core/services/taskService/task.res.dto';
import { CreateTaskReqDto, TaskPriority, UpdateTaskReqDto } from '@core/services/taskService/task.req.dto';
import { ProjectMemberDto } from '@core/services/projectService/project.res.dto';
import { WikiEditorComponent } from '@pages/platform/wiki/wiki-page/wiki-editor.component';
import { Button } from 'primeng/button';
import { Drawer } from 'primeng/drawer';
import { Select } from 'primeng/select';
import { MultiSelect } from 'primeng/multiselect';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { DatePicker } from 'primeng/datepicker';
import { Tooltip } from 'primeng/tooltip';
import { Textarea } from 'primeng/textarea';
import { SelectButton } from 'primeng/selectbutton';

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

@Component({
  selector: 'app-task-detail-dialog',
  standalone: true,
  imports: [
    FormsModule,
    Button,
    Drawer,
    Select,
    MultiSelect,
    InputText,
    InputNumber,
    DatePicker,
    Tooltip,
    Textarea,
    SelectButton,
    WikiEditorComponent,
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './task-detail-dialog.component.html',
  styleUrl: './task-detail-dialog.component.sass',
})
export class TaskDetailDialogComponent {
  visible = input(false);
  task = input<TaskResDto | null>(null);
  statuses = input<TaskStatusDto[]>([]);
  tags = input<TaskTagDto[]>([]);
  members = input<ProjectMemberDto[]>([]);
  tasks = input<TaskResDto[]>([]);
  defaultStatusId = input<number | null>(null);

  visibleChange = output<boolean>();
  save = output<CreateTaskReqDto | UpdateTaskReqDto>();
  delete = output<number>();

  form: FormState = this.emptyForm();
  showDeleteConfirm = false;
  descriptionMode = signal<'visual' | 'raw'>('visual');

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
      } else {
        this.form = this.emptyForm();
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

  get tagOptions(): SelectOption[] {
    return this.tags().map((t) => ({ label: t.nombre, value: t.id }));
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
      };
      this.save.emit(dto);
    } else {
      const dto: CreateTaskReqDto = {
        projectId: 0, // Se sobreescribe en el componente padre
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
