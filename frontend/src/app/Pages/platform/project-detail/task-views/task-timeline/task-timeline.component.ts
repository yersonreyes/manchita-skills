import { Component, computed, inject, signal } from '@angular/core';
import { TaskStoreService, TaskNode } from '@core/services/taskStoreService/task-store.service';
import { TaskResDto } from '@core/services/taskService/task.res.dto';
import { TaskPriority } from '@core/services/taskService/task.req.dto';
import { TaskViewsComponent } from '../task-views.component';
import { Button } from 'primeng/button';

type ZoomLevel = 'days' | 'weeks' | 'months';

interface TimelineColumn {
  label: string;
  date: Date;
  width: number;
}

interface FlatTask {
  task: TaskResDto;
  level: number;
}

@Component({
  selector: 'app-task-timeline',
  standalone: true,
  imports: [Button],
  templateUrl: './task-timeline.component.html',
  styleUrl: './task-timeline.component.sass',
})
export class TaskTimelineComponent {
  private readonly parent = inject(TaskViewsComponent);
  readonly store = inject(TaskStoreService);

  zoom = signal<ZoomLevel>('weeks');

  readonly priorityColors: Record<TaskPriority, string> = {
    URGENT: '#EF4444',
    HIGH: '#F59E0B',
    MEDIUM: '#3B82F6',
    LOW: '#6B7280',
  };

  readonly colWidths: Record<ZoomLevel, number> = {
    days: 40,
    weeks: 120,
    months: 200,
  };

  timeRange = computed(() => {
    const tasks = this.store.tasks().filter((t) => t.fechaInicio || t.fechaVencimiento);
    if (tasks.length === 0) {
      const now = new Date();
      return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: new Date(now.getFullYear(), now.getMonth() + 3, 0) };
    }
    const dates: Date[] = [];
    for (const t of tasks) {
      if (t.fechaInicio) dates.push(new Date(t.fechaInicio));
      if (t.fechaVencimiento) dates.push(new Date(t.fechaVencimiento));
    }
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));
    // Add padding
    minDate.setDate(minDate.getDate() - 7);
    maxDate.setDate(maxDate.getDate() + 7);
    return { start: minDate, end: maxDate };
  });

  columns = computed((): TimelineColumn[] => {
    const { start, end } = this.timeRange();
    const zoom = this.zoom();
    const cols: TimelineColumn[] = [];

    const cursor = new Date(start);
    cursor.setHours(0, 0, 0, 0);

    while (cursor <= end) {
      if (zoom === 'days') {
        cols.push({
          label: cursor.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }),
          date: new Date(cursor),
          width: this.colWidths.days,
        });
        cursor.setDate(cursor.getDate() + 1);
      } else if (zoom === 'weeks') {
        cols.push({
          label: cursor.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }),
          date: new Date(cursor),
          width: this.colWidths.weeks,
        });
        cursor.setDate(cursor.getDate() + 7);
      } else {
        cols.push({
          label: cursor.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }),
          date: new Date(cursor),
          width: this.colWidths.months,
        });
        cursor.setMonth(cursor.getMonth() + 1);
      }
    }
    return cols;
  });

  totalWidth = computed(() => this.columns().reduce((acc, c) => acc + c.width, 0));

  flatTasks = computed((): FlatTask[] => {
    const result: FlatTask[] = [];
    this.flattenTree(this.store.taskTree(), result);
    return result;
  });

  tasksWithDates = computed(() => this.flatTasks().filter((ft) => ft.task.fechaInicio || ft.task.fechaVencimiento));
  tasksWithoutDates = computed(() => this.flatTasks().filter((ft) => !ft.task.fechaInicio && !ft.task.fechaVencimiento));

  private flattenTree(nodes: TaskNode[], result: FlatTask[]): void {
    for (const node of nodes) {
      result.push({ task: node, level: node.level });
      if (node.children.length > 0) {
        this.flattenTree(node.children, result);
      }
    }
  }

  getBarStyle(task: TaskResDto): Record<string, string> | null {
    const { start } = this.timeRange();
    const zoom = this.zoom();
    const colWidth = this.colWidths[zoom];
    const rangeDays = zoom === 'days' ? 1 : zoom === 'weeks' ? 7 : 30;

    const taskStart = task.fechaInicio ? new Date(task.fechaInicio) : (task.fechaVencimiento ? new Date(task.fechaVencimiento) : null);
    const taskEnd = task.fechaVencimiento ? new Date(task.fechaVencimiento) : (task.fechaInicio ? new Date(task.fechaInicio) : null);

    if (!taskStart || !taskEnd) return null;

    const startDiff = Math.max(0, (taskStart.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.max(1, (taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24));

    const left = (startDiff / rangeDays) * colWidth;
    const width = Math.max(colWidth * 0.5, (duration / rangeDays) * colWidth);

    return {
      left: `${left}px`,
      width: `${width}px`,
      background: this.priorityColors[task.prioridad],
    };
  }

  setZoom(zoom: ZoomLevel): void {
    this.zoom.set(zoom);
  }

  openTask(task: TaskResDto): void {
    this.parent.openEditTask(task);
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  todayOffset = computed(() => {
    const { start } = this.timeRange();
    const zoom = this.zoom();
    const colWidth = this.colWidths[zoom];
    const rangeDays = zoom === 'days' ? 1 : zoom === 'weeks' ? 7 : 30;
    const today = new Date();
    const diff = (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    return (diff / rangeDays) * colWidth;
  });
}
