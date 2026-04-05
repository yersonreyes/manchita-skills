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

  async onTaskAutosave(dto: UpdateTaskReqDto): Promise<void> {
    const editing = this.editingTask();
    if (!editing) return;
    const incomingTagIds: number[] = (dto as any).tagIds ?? [];
    const { tagIds: _tags, ...updatePayload } = dto as any;
    try {
      const updated = await this.taskService.update(editing.id, updatePayload);
      const task = await this.syncTags(updated, editing.tags.map((t) => t.tagId), incomingTagIds);
      this.store.upsertTask(task);
      this.editingTask.set(task);
    } catch {
      // handled by http builder
    }
  }

  async onTaskSave(dto: CreateTaskReqDto | UpdateTaskReqDto): Promise<void> {
    const editing = this.editingTask();
    const incomingTagIds: number[] = (dto as any).tagIds ?? [];
    const { tagIds: _tags, ...payload } = dto as any;

    try {
      if (editing) {
        const updated = await this.taskService.update(editing.id, payload);
        const task = await this.syncTags(updated, editing.tags.map((t) => t.tagId), incomingTagIds);
        this.store.upsertTask(task);
        this.uiDialog.showSuccess('Tarea actualizada', `"${updated.titulo}" fue actualizada.`);
      } else {
        const created = await this.taskService.create({
          ...payload,
          projectId: this.projectId,
        });
        const task = await this.syncTags(created, [], incomingTagIds);
        this.store.upsertTask(task);
        this.uiDialog.showSuccess('Tarea creada', `"${task.titulo}" fue creada.`);
      }
      this.taskDialogVisible.set(false);
    } catch {
      // handled by http builder
    }
  }

  private async syncTags(
    task: import('@core/services/taskService/task.res.dto').TaskResDto,
    originalTagIds: number[],
    newTagIds: number[],
  ): Promise<import('@core/services/taskService/task.res.dto').TaskResDto> {
    const toAdd = newTagIds.filter((id) => !originalTagIds.includes(id));
    const toRemove = originalTagIds.filter((id) => !newTagIds.includes(id));

    if (!toAdd.length && !toRemove.length) return task;

    await Promise.all([
      ...toAdd.map((id) => this.taskService.assignTag(task.id, { tagId: id })),
      ...toRemove.map((id) => this.taskService.removeTag(task.id, id)),
    ]);

    return this.taskService.getById(task.id);
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
