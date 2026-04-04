import { Component, computed, inject, signal } from '@angular/core';
import { TaskStoreService } from '@core/services/taskStoreService/task-store.service';
import { TaskResDto } from '@core/services/taskService/task.res.dto';
import { TaskViewsComponent } from '../task-views.component';
import { Button } from 'primeng/button';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: TaskResDto[];
}

@Component({
  selector: 'app-task-calendar',
  standalone: true,
  imports: [Button],
  templateUrl: './task-calendar.component.html',
  styleUrl: './task-calendar.component.sass',
})
export class TaskCalendarComponent {
  private readonly parent = inject(TaskViewsComponent);
  readonly store = inject(TaskStoreService);

  currentDate = signal(new Date());

  readonly weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  monthLabel = computed(() => {
    const d = this.currentDate();
    return d.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
  });

  calendarDays = computed((): CalendarDay[] => {
    const d = this.currentDate();
    const year = d.getFullYear();
    const month = d.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Monday=0 offset
    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days: CalendarDay[] = [];

    // Previous month fill
    for (let i = startOffset - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        tasks: this.getTasksForDate(date),
      });
    }

    // Current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const isToday = date.getTime() === today.getTime();
      days.push({
        date,
        isCurrentMonth: true,
        isToday,
        tasks: this.getTasksForDate(date),
      });
    }

    // Next month fill (complete to 6 rows = 42 cells)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        tasks: this.getTasksForDate(date),
      });
    }

    return days;
  });

  private getTasksForDate(date: Date): TaskResDto[] {
    const key = this.toDateKey(date);
    return this.store.tasksByDate().get(key) ?? [];
  }

  private toDateKey(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  prevMonth(): void {
    const d = this.currentDate();
    this.currentDate.set(new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  nextMonth(): void {
    const d = this.currentDate();
    this.currentDate.set(new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  goToToday(): void {
    this.currentDate.set(new Date());
  }

  openTask(task: TaskResDto): void {
    this.parent.openEditTask(task);
  }
}
