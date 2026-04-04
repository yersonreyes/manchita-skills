import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TaskStatusService } from 'src/task-status/task-status.service';
import {
  CreateProjectRequestDto,
  UpdateProjectRequestDto,
  UpsertProjectMemberRequestDto,
} from './dto/project.req.dto';

const PROJECT_INCLUDE = {
  owner: {
    select: { id: true, nombre: true, email: true },
  },
  members: {
    include: {
      user: { select: { id: true, nombre: true, email: true } },
    },
  },
  phases: {
    include: { phase: true },
    orderBy: { orden: 'asc' as const },
  },
};

@Injectable()
export class ProjectService {
  constructor(
    private prisma: PrismaService,
    private taskStatusService: TaskStatusService,
  ) {}

  // ─── CREATE ───────────────────────────────────────────────────────────────
  async create(dto: CreateProjectRequestDto, ownerId: number) {
    const nombre = dto.nombre.trim();

    const res = await this.prisma.project.create({
      data: {
        nombre,
        descripcion: dto.descripcion?.trim() ?? null,
        tipo: dto.tipo ?? null,
        etapa: dto.etapa ?? null,
        sector: dto.sector?.trim() ?? null,
        contexto: dto.contexto?.trim() ?? null,
        estado: dto.estado ?? 'DRAFT',
        ownerId,
        activo: dto.activo ?? true,
      },
      include: PROJECT_INCLUDE,
    });

    await this.taskStatusService.seedDefaults(res.id);

    return { res, code: 0, message: 'Proyecto creado correctamente' };
  }

  // ─── FIND ALL ─────────────────────────────────────────────────────────────
  async findAll() {
    const res = await this.prisma.project.findMany({
      include: PROJECT_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });

    if (res.length === 0) {
      throw new NotFoundException({
        message: 'No se encontraron proyectos',
        code: 1,
      });
    }

    return { res, code: 0, message: 'Proyectos encontrados' };
  }

  // ─── FIND ONE ─────────────────────────────────────────────────────────────
  async findOne(id: number) {
    const res = await this.prisma.project.findUnique({
      where: { id },
      include: PROJECT_INCLUDE,
    });

    if (!res) {
      throw new NotFoundException({ message: 'Proyecto no encontrado', code: 1 });
    }

    return { res, code: 0, message: 'Proyecto encontrado' };
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  async update(id: number, dto: UpdateProjectRequestDto) {
    const existing = await this.prisma.project.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException({ message: 'Proyecto no encontrado', code: 1 });
    }

    const data: any = {};

    if (dto.nombre !== undefined) data.nombre = dto.nombre.trim();
    if (dto.descripcion !== undefined) data.descripcion = dto.descripcion?.trim() ?? null;
    if (dto.tipo !== undefined) data.tipo = dto.tipo ?? null;
    if (dto.etapa !== undefined) data.etapa = dto.etapa ?? null;
    if (dto.sector !== undefined) data.sector = dto.sector?.trim() ?? null;
    if (dto.contexto !== undefined) data.contexto = dto.contexto?.trim() ?? null;
    if (dto.estado !== undefined) data.estado = dto.estado;
    if (dto.activo !== undefined) data.activo = dto.activo;

    if (Object.keys(data).length === 0) {
      const current = await this.prisma.project.findUnique({
        where: { id },
        include: PROJECT_INCLUDE,
      });
      return { res: current, code: 0, message: 'No hay cambios para actualizar' };
    }

    const res = await this.prisma.project.update({
      where: { id },
      data,
      include: PROJECT_INCLUDE,
    });

    return { res, code: 0, message: 'Proyecto actualizado correctamente' };
  }

  // ─── UPSERT MEMBER ────────────────────────────────────────────────────────
  async upsertMember(projectId: number, dto: UpsertProjectMemberRequestDto) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException({ message: 'Proyecto no encontrado', code: 1 });
    }

    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException({ message: 'Usuario no encontrado', code: 1 });
    }

    const res = await this.prisma.projectMember.upsert({
      where: {
        projectId_userId: { projectId, userId: dto.userId },
      },
      update: { role: dto.role },
      create: { projectId, userId: dto.userId, role: dto.role },
      include: {
        user: { select: { id: true, nombre: true, email: true } },
      },
    });

    return { res, code: 0, message: 'Miembro actualizado correctamente' };
  }

  // ─── REMOVE MEMBER ────────────────────────────────────────────────────────
  async removeMember(projectId: number, userId: number) {
    const member = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
    if (!member) {
      throw new NotFoundException({ message: 'Miembro no encontrado en el proyecto', code: 1 });
    }

    await this.prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId } },
    });

    return { res: null, code: 0, message: 'Miembro eliminado correctamente' };
  }
}
