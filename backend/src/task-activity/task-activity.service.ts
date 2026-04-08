import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

const ACTIVITY_INCLUDE = {
  user: { select: { id: true, nombre: true, email: true } },
  task: { select: { id: true, titulo: true } },
};

@Injectable()
export class TaskActivityService {
  constructor(private prisma: PrismaService) {}

  // ─── FIND BY TASK ─────────────────────────────────────────────────────────
  async findByTask(taskId: number, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [res, total] = await Promise.all([
      this.prisma.taskActivity.findMany({
        where: { taskId },
        include: ACTIVITY_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.taskActivity.count({ where: { taskId } }),
    ]);

    return { res, total, code: 0, message: 'Actividades encontradas' };
  }

  // ─── FIND BY PROJECT ──────────────────────────────────────────────────────
  async findByProject(projectId: number, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [res, total] = await Promise.all([
      this.prisma.taskActivity.findMany({
        where: { task: { projectId, activo: true } },
        include: ACTIVITY_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.taskActivity.count({
        where: { task: { projectId, activo: true } },
      }),
    ]);

    return {
      res,
      total,
      code: 0,
      message: 'Actividades del proyecto encontradas',
    };
  }
}
