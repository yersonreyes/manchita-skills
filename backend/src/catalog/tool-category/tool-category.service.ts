import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateToolCategoryRequestDto,
  UpdateToolCategoryRequestDto,
} from './dto/tool-category.req.dto';

@Injectable()
export class ToolCategoryService {
  constructor(private prisma: PrismaService) {}

  // ─── CREATE ───────────────────────────────────────────────────────────────
  async create(dto: CreateToolCategoryRequestDto) {
    const codigo = dto.codigo.trim().toUpperCase();
    const nombre = dto.nombre.trim();

    const existing = await this.prisma.toolCategory.findUnique({
      where: { codigo },
    });
    if (existing) {
      throw new ConflictException({ message: 'El código ya existe', code: 1 });
    }

    const phase = await this.prisma.designPhase.findUnique({
      where: { id: dto.phaseId },
    });
    if (!phase) {
      throw new NotFoundException({ message: 'Fase de diseño no encontrada', code: 1 });
    }

    const res = await this.prisma.toolCategory.create({
      data: {
        codigo,
        nombre,
        descripcion: dto.descripcion?.trim() ?? null,
        phaseId: dto.phaseId,
        activo: dto.activo ?? true,
      },
      include: { phase: true },
    });

    return { res, code: 0, message: 'Categoría creada correctamente' };
  }

  // ─── FIND ALL ─────────────────────────────────────────────────────────────
  async findAll() {
    const res = await this.prisma.toolCategory.findMany({
      include: { phase: true },
      orderBy: { codigo: 'asc' },
    });

    if (res.length === 0) {
      throw new NotFoundException({
        message: 'No se encontraron categorías',
        code: 1,
      });
    }

    return { res, code: 0, message: 'Categorías encontradas' };
  }

  // ─── FIND BY PHASE ────────────────────────────────────────────────────────
  async findByPhase(phaseId: number) {
    const phase = await this.prisma.designPhase.findUnique({ where: { id: phaseId } });
    if (!phase) {
      throw new NotFoundException({ message: 'Fase de diseño no encontrada', code: 1 });
    }

    const res = await this.prisma.toolCategory.findMany({
      where: { phaseId },
      include: { phase: true },
      orderBy: { codigo: 'asc' },
    });

    if (res.length === 0) {
      throw new NotFoundException({
        message: 'No se encontraron categorías para esta fase',
        code: 1,
      });
    }

    return { res, code: 0, message: 'Categorías encontradas' };
  }

  // ─── FIND ONE ─────────────────────────────────────────────────────────────
  async findOne(id: number) {
    const res = await this.prisma.toolCategory.findUnique({
      where: { id },
      include: { phase: true },
    });

    if (!res) {
      throw new NotFoundException({ message: 'Categoría no encontrada', code: 1 });
    }

    return { res, code: 0, message: 'Categoría encontrada' };
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  async update(id: number, dto: UpdateToolCategoryRequestDto) {
    const existing = await this.prisma.toolCategory.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException({ message: 'Categoría no encontrada', code: 1 });
    }

    const data: any = {};

    if (dto.codigo !== undefined) {
      const codigo = dto.codigo.trim().toUpperCase();
      const duplicated = await this.prisma.toolCategory.findFirst({
        where: { codigo, NOT: { id } },
      });
      if (duplicated) {
        throw new ConflictException({ message: 'El código ya está en uso', code: 1 });
      }
      data.codigo = codigo;
    }

    if (dto.nombre !== undefined) data.nombre = dto.nombre.trim();
    if (dto.descripcion !== undefined) data.descripcion = dto.descripcion?.trim() ?? null;
    if (dto.activo !== undefined) data.activo = dto.activo;

    if (dto.phaseId !== undefined) {
      const phase = await this.prisma.designPhase.findUnique({
        where: { id: dto.phaseId },
      });
      if (!phase) {
        throw new NotFoundException({ message: 'Fase de diseño no encontrada', code: 1 });
      }
      data.phaseId = dto.phaseId;
    }

    if (Object.keys(data).length === 0) {
      return { res: existing, code: 0, message: 'No hay cambios para actualizar' };
    }

    const res = await this.prisma.toolCategory.update({
      where: { id },
      data,
      include: { phase: true },
    });

    return { res, code: 0, message: 'Categoría actualizada correctamente' };
  }
}
