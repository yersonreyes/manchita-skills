import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskAction } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AssignTagRequestDto,
  CreateTaskRequestDto,
  MoveTaskRequestDto,
  ReorderTaskRequestDto,
  UpdateTaskRequestDto,
} from './dto/task.req.dto';

const TASK_INCLUDE = {
  status: true,
  assignee: { select: { id: true, nombre: true, email: true } },
  createdBy: { select: { id: true, nombre: true, email: true } },
  parent: { select: { id: true, titulo: true } },
  toolApplication: { select: { id: true, titulo: true } },
  tags: {
    include: { tag: true },
  },
};

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  // ─── CREATE ───────────────────────────────────────────────────────────────
  async create(dto: CreateTaskRequestDto, createdById: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
    });
    if (!project) {
      throw new NotFoundException({ message: 'Proyecto no encontrado', code: 1 });
    }

    const status = await this.prisma.taskStatus.findUnique({
      where: { id: dto.statusId },
    });
    if (!status || status.projectId !== dto.projectId) {
      throw new NotFoundException({ message: 'Estado de tarea no encontrado', code: 1 });
    }

    if (dto.parentId) {
      const parent = await this.prisma.task.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent || parent.projectId !== dto.projectId) {
        throw new NotFoundException({ message: 'Tarea padre no encontrada', code: 1 });
      }
    }

    const task = await this.prisma.task.create({
      data: {
        projectId: dto.projectId,
        parentId: dto.parentId ?? null,
        statusId: dto.statusId,
        toolApplicationId: dto.toolApplicationId ?? null,
        assigneeId: dto.assigneeId ?? null,
        createdById,
        titulo: dto.titulo.trim(),
        descripcion: dto.descripcion?.trim() ?? null,
        prioridad: dto.prioridad ?? 'MEDIUM',
        fechaInicio: dto.fechaInicio ? new Date(dto.fechaInicio) : null,
        fechaVencimiento: dto.fechaVencimiento ? new Date(dto.fechaVencimiento) : null,
        estimacion: dto.estimacion ?? null,
        orden: dto.orden ?? 0,
      },
      include: TASK_INCLUDE,
    });

    await this.prisma.taskActivity.create({
      data: {
        taskId: task.id,
        userId: createdById,
        accion: TaskAction.CREATED,
      },
    });

    const res = await this.enrichWithSubtaskCounts(task);

    return { res, code: 0, message: 'Tarea creada correctamente' };
  }

  // ─── FIND BY PROJECT ──────────────────────────────────────────────────────
  async findByProject(
    projectId: number,
    filters?: {
      statusId?: number;
      assigneeId?: number;
      prioridad?: string;
      tagId?: number;
      fechaDesde?: string;
      fechaHasta?: string;
    },
  ) {
    const where: any = { projectId, activo: true };

    if (filters?.statusId) where.statusId = filters.statusId;
    if (filters?.assigneeId) where.assigneeId = filters.assigneeId;
    if (filters?.prioridad) where.prioridad = filters.prioridad;
    if (filters?.tagId) {
      where.tags = { some: { tagId: filters.tagId } };
    }
    if (filters?.fechaDesde || filters?.fechaHasta) {
      where.fechaVencimiento = {};
      if (filters.fechaDesde) where.fechaVencimiento.gte = new Date(filters.fechaDesde);
      if (filters.fechaHasta) where.fechaVencimiento.lte = new Date(filters.fechaHasta);
    }

    const tasks = await this.prisma.task.findMany({
      where,
      include: TASK_INCLUDE,
      orderBy: [{ orden: 'asc' }, { createdAt: 'asc' }],
    });

    const res = await Promise.all(tasks.map((t) => this.enrichWithSubtaskCounts(t)));

    return { res, code: 0, message: 'Tareas encontradas' };
  }

  // ─── FIND ONE ─────────────────────────────────────────────────────────────
  async findOne(id: number) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        ...TASK_INCLUDE,
        children: {
          where: { activo: true },
          include: TASK_INCLUDE,
          orderBy: { orden: 'asc' },
        },
        activities: {
          include: {
            user: { select: { id: true, nombre: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!task) {
      throw new NotFoundException({ message: 'Tarea no encontrada', code: 1 });
    }

    const res = await this.enrichWithSubtaskCounts(task);

    return { res, code: 0, message: 'Tarea encontrada' };
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  async update(id: number, dto: UpdateTaskRequestDto, userId: number) {
    const existing = await this.prisma.task.findUnique({
      where: { id },
      include: TASK_INCLUDE,
    });
    if (!existing) {
      throw new NotFoundException({ message: 'Tarea no encontrada', code: 1 });
    }

    const data: any = {};
    const activities: { accion: TaskAction; campoModificado?: string; valorAnterior?: string; valorNuevo?: string }[] = [];

    if (dto.titulo !== undefined && dto.titulo !== existing.titulo) {
      data.titulo = dto.titulo.trim();
      activities.push({
        accion: TaskAction.UPDATED,
        campoModificado: 'titulo',
        valorAnterior: existing.titulo,
        valorNuevo: data.titulo,
      });
    }

    if (dto.descripcion !== undefined) {
      data.descripcion = dto.descripcion?.trim() ?? null;
    }

    if (dto.prioridad !== undefined && dto.prioridad !== existing.prioridad) {
      data.prioridad = dto.prioridad;
      activities.push({
        accion: TaskAction.PRIORITY_CHANGED,
        campoModificado: 'prioridad',
        valorAnterior: existing.prioridad,
        valorNuevo: dto.prioridad,
      });
    }

    if (dto.statusId !== undefined && dto.statusId !== existing.statusId) {
      data.statusId = dto.statusId;
      const newStatus = await this.prisma.taskStatus.findUnique({ where: { id: dto.statusId } });
      activities.push({
        accion: TaskAction.STATUS_CHANGED,
        campoModificado: 'statusId',
        valorAnterior: existing.status?.nombre ?? String(existing.statusId),
        valorNuevo: newStatus?.nombre ?? String(dto.statusId),
      });

      if (newStatus?.isFinal) {
        data.fechaCompletado = new Date();
      } else if (existing.fechaCompletado) {
        data.fechaCompletado = null;
      }
    }

    if (dto.assigneeId !== undefined && dto.assigneeId !== existing.assigneeId) {
      data.assigneeId = dto.assigneeId;
      const newAssignee = dto.assigneeId
        ? await this.prisma.user.findUnique({ where: { id: dto.assigneeId }, select: { nombre: true } })
        : null;
      activities.push({
        accion: TaskAction.ASSIGNED,
        campoModificado: 'assigneeId',
        valorAnterior: existing.assignee?.nombre ?? 'Sin asignar',
        valorNuevo: newAssignee?.nombre ?? 'Sin asignar',
      });
    }

    if (dto.toolApplicationId !== undefined) data.toolApplicationId = dto.toolApplicationId;
    if (dto.fechaInicio !== undefined) data.fechaInicio = dto.fechaInicio ? new Date(dto.fechaInicio) : null;
    if (dto.fechaVencimiento !== undefined) data.fechaVencimiento = dto.fechaVencimiento ? new Date(dto.fechaVencimiento) : null;
    if (dto.estimacion !== undefined) data.estimacion = dto.estimacion;

    if (Object.keys(data).length === 0) {
      const res = await this.enrichWithSubtaskCounts(existing);
      return { res, code: 0, message: 'No hay cambios para actualizar' };
    }

    const [updatedTask] = await this.prisma.$transaction([
      this.prisma.task.update({
        where: { id },
        data,
        include: TASK_INCLUDE,
      }),
      ...activities.map((a) =>
        this.prisma.taskActivity.create({
          data: { taskId: id, userId, ...a },
        }),
      ),
    ]);

    const res = await this.enrichWithSubtaskCounts(updatedTask);

    return { res, code: 0, message: 'Tarea actualizada correctamente' };
  }

  // ─── MOVE (Kanban drag-drop) ──────────────────────────────────────────────
  async move(id: number, dto: MoveTaskRequestDto, userId: number) {
    const existing = await this.prisma.task.findUnique({
      where: { id },
      include: { status: true },
    });
    if (!existing) {
      throw new NotFoundException({ message: 'Tarea no encontrada', code: 1 });
    }

    const newStatus = await this.prisma.taskStatus.findUnique({
      where: { id: dto.statusId },
    });
    if (!newStatus) {
      throw new NotFoundException({ message: 'Estado destino no encontrado', code: 1 });
    }

    const data: any = { statusId: dto.statusId, orden: dto.orden };

    if (newStatus.isFinal) {
      data.fechaCompletado = new Date();
    } else if (existing.fechaCompletado) {
      data.fechaCompletado = null;
    }

    const activities: any[] = [];

    if (dto.statusId !== existing.statusId) {
      activities.push(
        this.prisma.taskActivity.create({
          data: {
            taskId: id,
            userId,
            accion: TaskAction.STATUS_CHANGED,
            campoModificado: 'statusId',
            valorAnterior: existing.status.nombre,
            valorNuevo: newStatus.nombre,
          },
        }),
      );
    }

    if (dto.orden !== existing.orden || dto.statusId !== existing.statusId) {
      activities.push(
        this.prisma.taskActivity.create({
          data: {
            taskId: id,
            userId,
            accion: TaskAction.MOVED,
            campoModificado: 'orden',
            valorAnterior: String(existing.orden),
            valorNuevo: String(dto.orden),
          },
        }),
      );
    }

    const [updatedTask] = await this.prisma.$transaction([
      this.prisma.task.update({
        where: { id },
        data,
        include: TASK_INCLUDE,
      }),
      ...activities,
    ]);

    const res = await this.enrichWithSubtaskCounts(updatedTask);

    return { res, code: 0, message: 'Tarea movida correctamente' };
  }

  // ─── REORDER ──────────────────────────────────────────────────────────────
  async reorder(id: number, dto: ReorderTaskRequestDto) {
    const existing = await this.prisma.task.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException({ message: 'Tarea no encontrada', code: 1 });
    }

    const res = await this.prisma.task.update({
      where: { id },
      data: { orden: dto.orden },
      include: TASK_INCLUDE,
    });

    return { res: await this.enrichWithSubtaskCounts(res), code: 0, message: 'Tarea reordenada' };
  }

  // ─── SOFT DELETE ──────────────────────────────────────────────────────────
  async softDelete(id: number, userId: number) {
    const existing = await this.prisma.task.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException({ message: 'Tarea no encontrada', code: 1 });
    }

    await this.prisma.$transaction([
      this.prisma.task.update({
        where: { id },
        data: { activo: false },
      }),
      this.prisma.taskActivity.create({
        data: {
          taskId: id,
          userId,
          accion: TaskAction.DELETED,
        },
      }),
    ]);

    return { res: null, code: 0, message: 'Tarea eliminada correctamente' };
  }

  // ─── ASSIGN TAG ───────────────────────────────────────────────────────────
  async assignTag(taskId: number, dto: AssignTagRequestDto) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException({ message: 'Tarea no encontrada', code: 1 });
    }

    await this.prisma.taskTagAssignment.create({
      data: { taskId, tagId: dto.tagId },
    });

    const res = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: TASK_INCLUDE,
    });

    return { res: await this.enrichWithSubtaskCounts(res), code: 0, message: 'Etiqueta asignada' };
  }

  // ─── REMOVE TAG ───────────────────────────────────────────────────────────
  async removeTag(taskId: number, tagId: number) {
    const assignment = await this.prisma.taskTagAssignment.findUnique({
      where: { taskId_tagId: { taskId, tagId } },
    });
    if (!assignment) {
      throw new NotFoundException({ message: 'Etiqueta no asignada a esta tarea', code: 1 });
    }

    await this.prisma.taskTagAssignment.delete({
      where: { taskId_tagId: { taskId, tagId } },
    });

    const res = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: TASK_INCLUDE,
    });

    return { res: await this.enrichWithSubtaskCounts(res), code: 0, message: 'Etiqueta removida' };
  }

  // ─── HELPERS ──────────────────────────────────────────────────────────────
  private async enrichWithSubtaskCounts(task: any) {
    const [total, completed] = await Promise.all([
      this.prisma.task.count({
        where: { parentId: task.id, activo: true },
      }),
      this.prisma.task.count({
        where: {
          parentId: task.id,
          activo: true,
          status: { isFinal: true },
        },
      }),
    ]);

    return { ...task, _subtaskCount: total, _subtaskCompletedCount: completed };
  }
}
