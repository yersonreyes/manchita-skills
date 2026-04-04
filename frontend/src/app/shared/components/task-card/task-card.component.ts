import { Component, input, output } from '@angular/core';
import { TaskResDto } from '@core/services/taskService/task.res.dto';
import { TaskPriority } from '@core/services/taskService/task.req.dto';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.sass',
})
export class TaskCardComponent {
  task = input.required<TaskResDto>();
  compact = input(false);
  cardClick = output<TaskResDto>();

  readonly priorityLabels: Record<TaskPriority, string> = {
    URGENT: 'Urgente',
    HIGH: 'Alta',
    MEDIUM: 'Media',
    LOW: 'Baja',
  };

  readonly priorityClasses: Record<TaskPriority, string> = {
    URGENT: 'task-card__priority--urgent',
    HIGH: 'task-card__priority--high',
    MEDIUM: 'task-card__priority--medium',
    LOW: 'task-card__priority--low',
  };

  onClick(): void {
    this.cardClick.emit(this.task());
  }

  getInitials(nombre: string): string {
    return nombre
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  formatDate(date: string): string {
    const d = new Date(date);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
  }

  isOverdue(): boolean {
    const t = this.task();
    if (!t.fechaVencimiento || t.status.isFinal) return false;
    return new Date(t.fechaVencimiento) < new Date();
  }
}
