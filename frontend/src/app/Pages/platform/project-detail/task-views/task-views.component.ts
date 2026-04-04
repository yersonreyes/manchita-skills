import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TaskStoreService } from '@core/services/taskStoreService/task-store.service';
import { TaskResDto, TaskStatusDto } from '@core/services/taskService/task.res.dto';
import { TaskService } from '@core/services/taskService/task.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { TaskDetailDialogComponent } from '@shared/components/task-detail-dialog/task-detail-dialog.component';
import { TaskFiltersComponent } from '@shared/components/task-filters/task-filters.component';
import { HasPermissionDirective } from '@shared/directives/has-permission.directive';
import { Button } from 'primeng/button';
import { TaskFilters } from '@core/services/taskStoreService/task-store.service';
import { CreateTaskReqDto, UpdateTaskReqDto } from '@core/services/taskService/task.req.dto';

@Component({
  selector: 'app-task-views',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    Button,
    PageHeaderComponent,
    HasPermissionDirective,
    TaskDetailDialogComponent,
    TaskFiltersComponent,
  ],
  providers: [TaskStoreService],
  templateUrl: './task-views.component.html',
  styleUrl: './task-views.component.sass',
})
export class TaskViewsComponent implements OnInit {
  readonly store = inject(TaskStoreService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly taskService = inject(TaskService);
  private readonly uiDialog = inject(UiDialogService);

  projectId = 0;
  taskDialogVisible = signal(false);
  editingTask = signal<TaskResDto | null>(null);
  defaultStatusId = signal<number | null>(null);

  readonly tabs = [
    { label: 'Tablero', path: 'board', icon: 'pi pi-th-large' },
    { label: 'Lista', path: 'list', icon: 'pi pi-list' },
    { label: 'Calendario', path: 'calendar', icon: 'pi pi-calendar' },
    { label: 'Línea de tiempo', path: 'timeline', icon: 'pi pi-chart-bar' },
    { label: 'Actividad', path: 'activity', icon: 'pi pi-history' },
  ];

  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    void this.store.loadAll(this.projectId);
  }

  openNewTask(statusId?: number): void {
    this.editingTask.set(null);
    this.defaultStatusId.set(statusId ?? null);
    this.taskDialogVisible.set(true);
  }

  openEditTask(task: TaskResDto): void {
    this.editingTask.set(task);
    this.defaultStatusId.set(null);
    this.taskDialogVisible.set(true);
  }

  async onTaskSave(dto: CreateTaskReqDto | UpdateTaskReqDto): Promise<void> {
    const editing = this.editingTask();
    try {
      if (editing) {
        const updated = await this.taskService.update(editing.id, dto as UpdateTaskReqDto);
        this.store.upsertTask(updated);
        this.uiDialog.showSuccess('Tarea actualizada', `"${updated.titulo}" fue actualizada.`);
      } else {
        const created = await this.taskService.create({
          ...(dto as CreateTaskReqDto),
          projectId: this.projectId,
        });
        this.store.upsertTask(created);
        this.uiDialog.showSuccess('Tarea creada', `"${created.titulo}" fue creada.`);
      }
      this.taskDialogVisible.set(false);
    } catch {
      // handled by http builder
    }
  }

  async onTaskDelete(taskId: number): Promise<void> {
    try {
      await this.taskService.delete(taskId);
      this.store.removeTask(taskId);
      this.taskDialogVisible.set(false);
      this.uiDialog.showSuccess('Tarea eliminada', 'La tarea fue eliminada.');
    } catch {
      // handled
    }
  }

  onFiltersChange(filters: TaskFilters): void {
    this.store.updateFilters(filters);
  }

  goBack(): void {
    void this.router.navigate(['/platform/projects', this.projectId]);
  }

  getFirstStatus(): TaskStatusDto | null {
    const statuses = this.store.statuses();
    return statuses.length > 0 ? statuses[0] : null;
  }
}
