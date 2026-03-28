import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateProjectPhaseRequestDto,
  UpdateProjectPhaseRequestDto,
} from './dto/project-phase.req.dto';

const PHASE_INCLUDE = {
  phase: true,
  project: {
    select: { id: true, nombre: true },
  },
};

@Injectable()
export class ProjectPhaseService {
  constructor(private prisma: PrismaService) {}

  // ─── CREATE ───────────────────────────────────────────────────────────────
  async create(dto: CreateProjectPhaseRequestDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
    });
    if (!project) {
      throw new NotFoundException({ message: 'Proyecto no encontrado', code: 1 });
    }

    const designPhase = await this.prisma.designPhase.findUnique({
      where: { id: dto.phaseId },
    });
    if (!designPhase) {
      throw new NotFoundException({ message: 'Fase de diseño no encontrada', code: 1 });
    }

    const existing = await this.prisma.projectPhase.findFirst({
      where: { projectId: dto.projectId, phaseId: dto.phaseId, orden: dto.orden },
    });
    if (existing) {
      throw new ConflictException({
        message: 'Ya existe una fase con ese orden en este proyecto',
        code: 1,
      });
    }

    const res = await this.prisma.projectPhase.create({
      data: {
        projectId: dto.projectId,
        phaseId: dto.phaseId,
        orden: dto.orden,
        estado: dto.estado ?? 'NOT_STARTED',
        notas: dto.notas ?? null,
      },
      include: PHASE_INCLUDE,
    });

    return { res, code: 0, message: 'Fase de proyecto creada correctamente' };
  }

  // ─── FIND BY PROJECT ──────────────────────────────────────────────────────
  async findByProject(projectId: number) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException({ message: 'Proyecto no encontrado', code: 1 });
    }

    const res = await this.prisma.projectPhase.findMany({
      where: { projectId },
      include: PHASE_INCLUDE,
      orderBy: { orden: 'asc' },
    });

    if (res.length === 0) {
      throw new NotFoundException({
        message: 'No se encontraron fases para este proyecto',
        code: 1,
      });
    }

    return { res, code: 0, message: 'Fases del proyecto encontradas' };
  }

  // ─── FIND ONE ─────────────────────────────────────────────────────────────
  async findOne(id: number) {
    const res = await this.prisma.projectPhase.findUnique({
      where: { id },
      include: PHASE_INCLUDE,
    });

    if (!res) {
      throw new NotFoundException({ message: 'Fase de proyecto no encontrada', code: 1 });
    }

    return { res, code: 0, message: 'Fase de proyecto encontrada' };
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  async update(id: number, dto: UpdateProjectPhaseRequestDto) {
    const existing = await this.prisma.projectPhase.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException({ message: 'Fase de proyecto no encontrada', code: 1 });
    }

    const data: any = {};

    if (dto.estado !== undefined) data.estado = dto.estado;
    if (dto.orden !== undefined) data.orden = dto.orden;
    if (dto.notas !== undefined) data.notas = dto.notas ?? null;

    if (Object.keys(data).length === 0) {
      const current = await this.prisma.projectPhase.findUnique({
        where: { id },
        include: PHASE_INCLUDE,
      });
      return { res: current, code: 0, message: 'No hay cambios para actualizar' };
    }

    const res = await this.prisma.projectPhase.update({
      where: { id },
      data,
      include: PHASE_INCLUDE,
    });

    return { res, code: 0, message: 'Fase de proyecto actualizada correctamente' };
  }
}
