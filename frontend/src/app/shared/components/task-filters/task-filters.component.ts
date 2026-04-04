import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskStatusDto, TaskTagDto } from '@core/services/taskService/task.res.dto';
import { TaskFilters } from '@core/services/taskStoreService/task-store.service';
import { ProjectMemberDto } from '@core/services/projectService/project.res.dto';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';

interface SelectOption {
  label: string;
  value: string | number | null;
}

@Component({
  selector: 'app-task-filters',
  standalone: true,
  imports: [FormsModule, Button, Select, DatePicker],
  templateUrl: './task-filters.component.html',
  styleUrl: './task-filters.component.sass',
})
export class TaskFiltersComponent {
  statuses = input<TaskStatusDto[]>([]);
  tags = input<TaskTagDto[]>([]);
  members = input<ProjectMemberDto[]>([]);

  filtersChange = output<TaskFilters>();

  filters: TaskFilters = {};

  readonly priorityOptions: SelectOption[] = [
    { label: 'Urgente', value: 'URGENT' },
    { label: 'Alta', value: 'HIGH' },
    { label: 'Media', value: 'MEDIUM' },
    { label: 'Baja', value: 'LOW' },
  ];

  get statusOptions(): SelectOption[] {
    return this.statuses().map((s) => ({ label: s.nombre, value: s.id }));
  }

  get tagOptions(): SelectOption[] {
    return this.tags().map((t) => ({ label: t.nombre, value: t.id }));
  }

  get memberOptions(): SelectOption[] {
    return this.members().map((m) => ({ label: m.user.nombre, value: m.user.id }));
  }

  onFilterChange(): void {
    this.filtersChange.emit({ ...this.filters });
  }

  clearFilters(): void {
    this.filters = {};
    this.filtersChange.emit({});
  }

  get hasActiveFilters(): boolean {
    return !!(
      this.filters.statusId ||
      this.filters.assigneeId ||
      this.filters.prioridad ||
      this.filters.tagId ||
      this.filters.fechaDesde ||
      this.filters.fechaHasta
    );
  }
}
