import { Injectable, computed, inject, signal } from '@angular/core';
import { TaskResDto, TaskStatusDto, TaskTagDto, TaskActivityDto } from '../taskService/task.res.dto';
import { TaskService } from '../taskService/task.service';
import { TaskStatusService } from '../taskStatusService/task-status.service';
import { TaskTagService } from '../taskTagService/task-tag.service';
import { TaskActivityService } from '../taskActivityService/task-activity.service';
import { ProjectMemberDto } from '../projectService/project.res.dto';
import { ProjectService } from '../projectService/project.service';

export interface TaskFilters {
  statusId?: number | null;
  assigneeId?: number | null;
  prioridad?: string | null;
  tagId?: number | null;
  fechaDesde?: Date | null;
  fechaHasta?: Date | null;
}

export interface TaskNode extends TaskResDto {
  children: TaskNode[];
  level: number;
}

@Injectable()
export class TaskStoreService {
  private readonly taskService = inject(TaskService);
  private readonly statusService = inject(TaskStatusService);
  private readonly tagService = inject(TaskTagService);
  private readonly activityService = inject(TaskActivityService);
  private readonly projectService = inject(ProjectService);

  // ─── Raw state ───────────────────────────────────────────────────────────
  tasks = signal<TaskResDto[]>([]);
  statuses = signal<TaskStatusDto[]>([]);
  tags = signal<TaskTagDto[]>([]);
  members = signal<ProjectMemberDto[]>([]);
  activities = signal<TaskActivityDto[]>([]);
  filters = signal<TaskFilters>({});
  loading = signal(false);
  activityTotal = signal(0);
  activityPage = signal(1);

  // ─── Computed derivations ─────────────────────────────────────────────────
  filteredTasks = computed(() => {
    const f = this.filters();
    return this.tasks().filter((t) => {
      if (f.statusId && t.statusId !== f.statusId) return false;
      if (f.assigneeId && t.assigneeId !== f.assigneeId) return false;
      if (f.prioridad && t.prioridad !== f.prioridad) return false;
      if (f.tagId && !t.tags.some((tg) => tg.tagId === f.tagId)) return false;
      if (f.fechaDesde && t.fechaVencimiento) {
        if (new Date(t.fechaVencimiento) < f.fechaDesde) return false;
      }
      if (f.fechaHasta && t.fechaVencimiento) {
        if (new Date(t.fechaVencimiento) > f.fechaHasta) return false;
      }
      return true;
    });
  });

  tasksByStatus = computed(() => {
    const map = new Map<number, TaskResDto[]>();
    for (const s of this.statuses()) {
      map.set(s.id, []);
    }
    for (const t of this.filteredTasks()) {
      if (!map.has(t.statusId)) map.set(t.statusId, []);
      map.get(t.statusId)!.push(t);
    }
    // Sort tasks within each status by orden
    for (const [key, arr] of map.entries()) {
      map.set(key, arr.sort((a, b) => a.orden - b.orden));
    }
    return map;
  });

  tasksByDate = computed(() => {
    const map = new Map<string, TaskResDto[]>();
    for (const t of this.filteredTasks()) {
      if (t.fechaVencimiento) {
        const key = t.fechaVencimiento.split('T')[0];
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(t);
      }
    }
    return map;
  });

  taskTree = computed((): TaskNode[] => {
    const allTasks = this.filteredTasks();
    const map = new Map<number, TaskNode>();
    const roots: TaskNode[] = [];

    for (const t of allTasks) {
      map.set(t.id, { ...t, children: [], level: 0 });
    }

    for (const [, node] of map.entries()) {
      if (node.parentId && map.has(node.parentId)) {
        const parent = map.get(node.parentId)!;
        node.level = parent.level + 1;
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots.sort((a, b) => a.orden - b.orden);
  });

  // ─── Load methods ─────────────────────────────────────────────────────────
  async loadAll(projectId: number): Promise<void> {
    this.loading.set(true);
    try {
      const [tasks, statuses, tags, project] = await Promise.all([
        this.taskService.getByProject(projectId),
        this.statusService.getByProject(projectId),
        this.tagService.getByProject(projectId),
        this.projectService.getById(projectId),
      ]);
      this.tasks.set(tasks ?? []);
      this.statuses.set((statuses ?? []).sort((a, b) => a.orden - b.orden));
      this.tags.set(tags ?? []);

      // Incluir el owner como participante aunque no esté en la tabla members
      const memberIds = new Set((project.members ?? []).map((m) => m.user.id));
      const allMembers: ProjectMemberDto[] = [...(project.members ?? [])];
      if (!memberIds.has(project.owner.id)) {
        allMembers.unshift({ user: project.owner, role: 'OWNER' as any });
      }
      this.members.set(allMembers);
    } catch {
      // Handled by http builder
    } finally {
      this.loading.set(false);
    }
  }

  async loadActivities(projectId: number, page = 1): Promise<void> {
    try {
      const res = await this.activityService.getByProject(projectId, page);
      if (page === 1) {
        this.activities.set(res.res ?? []);
      } else {
        this.activities.update((prev) => [...prev, ...(res.res ?? [])]);
      }
      this.activityTotal.set(res.total);
      this.activityPage.set(page);
    } catch {
      // Handled
    }
  }

  async reloadTasks(projectId: number): Promise<void> {
    try {
      const tasks = await this.taskService.getByProject(projectId);
      this.tasks.set(tasks ?? []);
    } catch {
      // Handled
    }
  }

  updateFilters(filters: Partial<TaskFilters>): void {
    this.filters.update((f) => ({ ...f, ...filters }));
  }

  clearFilters(): void {
    this.filters.set({});
  }

  upsertTask(task: TaskResDto): void {
    this.tasks.update((tasks) => {
      const idx = tasks.findIndex((t) => t.id === task.id);
      if (idx >= 0) {
        const copy = [...tasks];
        copy[idx] = task;
        return copy;
      }
      return [...tasks, task];
    });
  }

  removeTask(taskId: number): void {
    this.tasks.update((tasks) => tasks.filter((t) => t.id !== taskId));
  }

  addTag(tag: TaskTagDto): void {
    this.tags.update((tags) => {
      if (tags.some((t) => t.id === tag.id)) return tags;
      return [...tags, tag];
    });
  }
}
