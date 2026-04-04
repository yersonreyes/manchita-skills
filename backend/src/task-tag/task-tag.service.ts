import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateTaskTagRequestDto,
  UpdateTaskTagRequestDto,
} from './dto/task-tag.req.dto';

@Injectable()
export class TaskTagService {
  constructor(private prisma: PrismaService) {}

  // ─── CREATE ───────────────────────────────────────────────────────────────
  async create(dto: CreateTaskTagRequestDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
    });
    if (!project) {
      throw new NotFoundException({ message: 'Proyecto no encontrado', code: 1 });
    }

    const res = await this.prisma.taskTag.create({
      data: {
        projectId: dto.projectId,
        nombre: dto.nombre.trim(),
        color: dto.color.trim(),
      },
    });

    return { res, code: 0, message: 'Etiqueta creada correctamente' };
  }

  // ─── FIND BY PROJECT ──────────────────────────────────────────────────────
  async findByProject(projectId: number) {
    const res = await this.prisma.taskTag.findMany({
      where: { projectId },
      orderBy: { nombre: 'asc' },
    });

    return { res, code: 0, message: 'Etiquetas encontradas' };
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  async update(id: number, dto: UpdateTaskTagRequestDto) {
    const existing = await this.prisma.taskTag.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException({ message: 'Etiqueta no encontrada', code: 1 });
    }

    const data: any = {};
    if (dto.nombre !== undefined) data.nombre = dto.nombre.trim();
    if (dto.color !== undefined) data.color = dto.color.trim();

    if (Object.keys(data).length === 0) {
      return { res: existing, code: 0, message: 'No hay cambios para actualizar' };
    }

    const res = await this.prisma.taskTag.update({ where: { id }, data });

    return { res, code: 0, message: 'Etiqueta actualizada correctamente' };
  }

  // ─── DELETE ───────────────────────────────────────────────────────────────
  async delete(id: number) {
    const existing = await this.prisma.taskTag.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException({ message: 'Etiqueta no encontrada', code: 1 });
    }

    await this.prisma.taskTag.delete({ where: { id } });

    return { res: null, code: 0, message: 'Etiqueta eliminada correctamente' };
  }
}
