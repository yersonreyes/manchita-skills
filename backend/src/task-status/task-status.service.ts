import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateTaskStatusRequestDto,
  UpdateTaskStatusRequestDto,
} from './dto/task-status.req.dto';

const DEFAULT_STATUSES = [
  { nombre: 'Backlog', color: '#6B7280', orden: 0, isFinal: false },
  { nombre: 'Por Hacer', color: '#3B82F6', orden: 1, isFinal: false },
  { nombre: 'En Progreso', color: '#F59E0B', orden: 2, isFinal: false },
  { nombre: 'En Revisión', color: '#8B5CF6', orden: 3, isFinal: false },
  { nombre: 'Hecho', color: '#10B981', orden: 4, isFinal: true },
];

@Injectable()
export class TaskStatusService {
  constructor(private prisma: PrismaService) {}

  // ─── SEED DEFAULTS ────────────────────────────────────────────────────────
  async seedDefaults(projectId: number) {
    await this.prisma.taskStatus.createMany({
      data: DEFAULT_STATUSES.map((s) => ({ ...s, projectId })),
    });
  }

  // ─── CREATE ───────────────────────────────────────────────────────────────
  async create(dto: CreateTaskStatusRequestDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
    });
    if (!project) {
      throw new NotFoundException({
        message: 'Proyecto no encontrado',
        code: 1,
      });
    }

    const res = await this.prisma.taskStatus.create({
      data: {
        projectId: dto.projectId,
        nombre: dto.nombre.trim(),
        color: dto.color.trim(),
        orden: dto.orden,
        isFinal: dto.isFinal ?? false,
      },
    });

    return { res, code: 0, message: 'Estado de tarea creado correctamente' };
  }

  // ─── FIND BY PROJECT ──────────────────────────────────────────────────────
  async findByProject(projectId: number) {
    const res = await this.prisma.taskStatus.findMany({
      where: { projectId, activo: true },
      orderBy: { orden: 'asc' },
    });

    return { res, code: 0, message: 'Estados de tarea encontrados' };
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  async update(id: number, dto: UpdateTaskStatusRequestDto) {
    const existing = await this.prisma.taskStatus.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException({
        message: 'Estado de tarea no encontrado',
        code: 1,
      });
    }

    const data: any = {};
    if (dto.nombre !== undefined) data.nombre = dto.nombre.trim();
    if (dto.color !== undefined) data.color = dto.color.trim();
    if (dto.orden !== undefined) data.orden = dto.orden;
    if (dto.isFinal !== undefined) data.isFinal = dto.isFinal;
    if (dto.activo !== undefined) data.activo = dto.activo;

    if (Object.keys(data).length === 0) {
      return {
        res: existing,
        code: 0,
        message: 'No hay cambios para actualizar',
      };
    }

    const res = await this.prisma.taskStatus.update({
      where: { id },
      data,
    });

    return {
      res,
      code: 0,
      message: 'Estado de tarea actualizado correctamente',
    };
  }

  // ─── DELETE ───────────────────────────────────────────────────────────────
  async delete(id: number) {
    const existing = await this.prisma.taskStatus.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException({
        message: 'Estado de tarea no encontrado',
        code: 1,
      });
    }

    const taskCount = await this.prisma.task.count({
      where: { statusId: id, activo: true },
    });
    if (taskCount > 0) {
      throw new ConflictException({
        message: `No se puede eliminar: hay ${taskCount} tarea(s) con este estado`,
        code: 1,
      });
    }

    await this.prisma.taskStatus.delete({ where: { id } });

    return {
      res: null,
      code: 0,
      message: 'Estado de tarea eliminado correctamente',
    };
  }
}
