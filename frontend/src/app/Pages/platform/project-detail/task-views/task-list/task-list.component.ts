import { Component, inject, signal } from '@angular/core';
import { TaskStoreService, TaskNode } from '@core/services/taskStoreService/task-store.service';
import { TaskResDto } from '@core/services/taskService/task.res.dto';
import { TaskPriority } from '@core/services/taskService/task.req.dto';
import { TaskViewsComponent } from '../task-views.component';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [TableModule, Tag, Button],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.sass',
})
export class TaskListComponent {
  private readonly parent = inject(TaskViewsComponent);
  readonly store = inject(TaskStoreService);

  expandedNodes = signal<Set<number>>(new Set());

  readonly priorityLabels: Record<TaskPriority, string> = {
    URGENT: 'Urgente',
    HIGH: 'Alta',
    MEDIUM: 'Media',
    LOW: 'Baja',
  };

  readonly prioritySeverity: Record<TaskPriority, 'danger' | 'warn' | 'info' | 'secondary'> = {
    URGENT: 'danger',
    HIGH: 'warn',
    MEDIUM: 'info',
    LOW: 'secondary',
  };

  get flatList(): TaskResDto[] {
    return this.flattenTree(this.store.taskTree());
  }

  private flattenTree(nodes: TaskNode[]): TaskResDto[] {
    const result: TaskResDto[] = [];
    for (const node of nodes) {
      result.push(node);
      if (node.children.length > 0 && this.expandedNodes().has(node.id)) {
        result.push(...this.flattenTree(node.children));
      }
    }
    return result;
  }

  hasChildren(task: TaskResDto): boolean {
    return task._subtaskCount > 0;
  }

  isExpanded(taskId: number): boolean {
    return this.expandedNodes().has(taskId);
  }

  toggleExpand(taskId: number): void {
    this.expandedNodes.update((set) => {
      const next = new Set(set);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  }

  getLevel(task: TaskResDto): number {
    const node = this.findNode(this.store.taskTree(), task.id);
    return node?.level ?? 0;
  }

  private findNode(nodes: TaskNode[], id: number): TaskNode | null {
    for (const node of nodes) {
      if (node.id === id) return node;
      const found = this.findNode(node.children, id);
      if (found) return found;
    }
    return null;
  }

  getPriorityLabel(prioridad: string): string {
    return this.priorityLabels[prioridad as TaskPriority] ?? prioridad;
  }

  getPrioritySeverity(prioridad: string): 'danger' | 'warn' | 'info' | 'secondary' {
    return this.prioritySeverity[prioridad as TaskPriority] ?? 'secondary';
  }

  openTask(task: TaskResDto): void {
    this.parent.openEditTask(task);
  }

  formatDate(date: string | null): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: '2-digit' });
  }
}
