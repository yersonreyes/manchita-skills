import { Component, inject, signal } from '@angular/core';
import { TaskStoreService } from '@core/services/taskStoreService/task-store.service';
import { TaskResDto, TaskStatusDto } from '@core/services/taskService/task.res.dto';
import { TaskService } from '@core/services/taskService/task.service';
import { TaskCardComponent } from '@shared/components/task-card/task-card.component';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { TaskViewsComponent } from '../task-views.component';

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [TaskCardComponent],
  templateUrl: './task-board.component.html',
  styleUrl: './task-board.component.sass',
})
export class TaskBoardComponent {
  private readonly parent = inject(TaskViewsComponent);
  readonly store = inject(TaskStoreService);
  private readonly taskService = inject(TaskService);
  private readonly uiDialog = inject(UiDialogService);

  draggedTaskId = signal<number | null>(null);
  dragOverStatusId = signal<number | null>(null);

  get statuses(): TaskStatusDto[] {
    return this.store.statuses();
  }

  getTasksForStatus(statusId: number): TaskResDto[] {
    return this.store.tasksByStatus().get(statusId) ?? [];
  }

  openNewTask(statusId: number): void {
    this.parent.openNewTask(statusId);
  }

  openTask(task: TaskResDto): void {
    this.parent.openEditTask(task);
  }

  // ─── Drag and Drop ───────────────────────────────────────────────────────
  onDragStart(event: DragEvent, taskId: number): void {
    this.draggedTaskId.set(taskId);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(taskId));
    }
  }

  onDragEnd(): void {
    this.draggedTaskId.set(null);
    this.dragOverStatusId.set(null);
  }

  onDragOver(event: DragEvent, statusId: number): void {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    this.dragOverStatusId.set(statusId);
  }

  onDragLeave(): void {
    this.dragOverStatusId.set(null);
  }

  async onDrop(event: DragEvent, statusId: number): Promise<void> {
    event.preventDefault();
    const taskId = this.draggedTaskId();
    this.dragOverStatusId.set(null);
    this.draggedTaskId.set(null);

    if (!taskId) return;

    const task = this.store.tasks().find((t) => t.id === taskId);
    if (!task || task.statusId === statusId) return;

    const tasksInTarget = this.getTasksForStatus(statusId);
    const newOrden = tasksInTarget.length + 1;

    try {
      const updated = await this.taskService.move(taskId, { statusId, orden: newOrden });
      this.store.upsertTask(updated);
    } catch {
      // handled by http builder
    }
  }

  isDragging(taskId: number): boolean {
    return this.draggedTaskId() === taskId;
  }

  isDragOver(statusId: number): boolean {
    return this.dragOverStatusId() === statusId;
  }
}
