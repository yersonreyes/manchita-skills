import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TaskStoreService } from '@core/services/taskStoreService/task-store.service';
import { TaskActivityDto } from '@core/services/taskService/task.res.dto';
import { Button } from 'primeng/button';
import { TimelineModule } from 'primeng/timeline';

@Component({
  selector: 'app-task-activity-view',
  standalone: true,
  imports: [Button, TimelineModule],
  templateUrl: './task-activity-view.component.html',
  styleUrl: './task-activity-view.component.sass',
})
export class TaskActivityViewComponent implements OnInit {
  private readonly store = inject(TaskStoreService);
  private readonly route = inject(ActivatedRoute);

  loading = signal(false);
  projectId = 0;

  activities = computed(() => this.store.activities());
  total = computed(() => this.store.activityTotal());
  page = computed(() => this.store.activityPage());

  get hasMore(): boolean {
    return this.activities().length < this.total();
  }

  ngOnInit(): void {
    this.projectId = Number(this.route.parent?.snapshot.paramMap.get('id'));
    if (this.activities().length === 0) {
      void this.loadActivities(1);
    }
  }

  async loadActivities(page: number): Promise<void> {
    this.loading.set(true);
    try {
      await this.store.loadActivities(this.projectId, page);
    } finally {
      this.loading.set(false);
    }
  }

  loadMore(): void {
    void this.loadActivities(this.page() + 1);
  }

  describeAction(activity: TaskActivityDto): string {
    const user = activity.user.nombre;
    const campo = activity.campoModificado;
    const anterior = activity.valorAnterior;
    const nuevo = activity.valorNuevo;

    switch (activity.accion) {
      case 'CREATED':
        return `${user} creó la tarea`;
      case 'UPDATED':
        if (campo === 'statusId' || campo === 'status') {
          return `${user} movió de "${anterior ?? '?'}" a "${nuevo ?? '?'}"`;
        }
        if (campo === 'assigneeId' || campo === 'assignee') {
          return nuevo ? `${user} asignó a ${nuevo}` : `${user} quitó la asignación`;
        }
        if (campo === 'prioridad') {
          return `${user} cambió la prioridad de "${anterior ?? '?'}" a "${nuevo ?? '?'}"`;
        }
        if (campo === 'titulo') {
          return `${user} renombró la tarea a "${nuevo ?? '?'}"`;
        }
        return `${user} actualizó ${campo ?? 'la tarea'}`;
      case 'MOVED':
        return `${user} movió de "${anterior ?? '?'}" a "${nuevo ?? '?'}"`;
      case 'DELETED':
        return `${user} eliminó la tarea`;
      default:
        return `${user} actualizó la tarea`;
    }
  }

  relativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'hace unos segundos';
    if (diffMins < 60) return `hace ${diffMins} min`;
    if (diffHours < 24) return `hace ${diffHours} h`;
    if (diffDays === 1) return 'ayer';
    if (diffDays < 7) return `hace ${diffDays} días`;
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: '2-digit' });
  }

  getActionIcon(accion: string): string {
    const iconMap: Record<string, string> = {
      CREATED: 'pi pi-plus-circle',
      UPDATED: 'pi pi-pencil',
      MOVED: 'pi pi-arrows-h',
      DELETED: 'pi pi-trash',
    };
    return iconMap[accion] ?? 'pi pi-info-circle';
  }

  getActionColor(accion: string): string {
    const colorMap: Record<string, string> = {
      CREATED: '#10B981',
      UPDATED: '#3B82F6',
      MOVED: '#F59E0B',
      DELETED: '#EF4444',
    };
    return colorMap[accion] ?? '#6B7280';
  }

  getInitials(nombre: string): string {
    return nombre
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }
}
