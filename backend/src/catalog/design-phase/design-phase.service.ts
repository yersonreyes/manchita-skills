import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateDesignPhaseRequestDto,
  UpdateDesignPhaseRequestDto,
} from './dto/design-phase.req.dto';

@Injectable()
export class DesignPhaseService {
  constructor(private prisma: PrismaService) {}

  // ─── CREATE ───────────────────────────────────────────────────────────────
  async create(dto: CreateDesignPhaseRequestDto) {
    const codigo = dto.codigo.trim().toUpperCase();
    const nombre = dto.nombre.trim();
    const descripcion = dto.descripcion.trim();

    const existing = await this.prisma.designPhase.findUnique({
      where: { codigo },
    });
    if (existing) {
      throw new ConflictException({ message: 'El código ya existe', code: 1 });
    }

    const res = await this.prisma.designPhase.create({
      data: {
        codigo,
        nombre,
        descripcion,
        orden: dto.orden,
        activo: dto.activo ?? true,
      },
    });

    return { res, code: 0, message: 'Fase de diseño creada correctamente' };
  }

  // ─── FIND ALL ─────────────────────────────────────────────────────────────
  async findAll() {
    const res = await this.prisma.designPhase.findMany({
      orderBy: { orden: 'asc' },
    });

    if (res.length === 0) {
      throw new NotFoundException({
        message: 'No se encontraron fases de diseño',
        code: 1,
      });
    }

    return { res, code: 0, message: 'Fases de diseño encontradas' };
  }

  // ─── FIND ONE ─────────────────────────────────────────────────────────────
  async findOne(id: number) {
    const res = await this.prisma.designPhase.findUnique({ where: { id } });

    if (!res) {
      throw new NotFoundException({
        message: 'Fase de diseño no encontrada',
        code: 1,
      });
    }

    return { res, code: 0, message: 'Fase de diseño encontrada' };
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  async update(id: number, dto: UpdateDesignPhaseRequestDto) {
    const existing = await this.prisma.designPhase.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException({
        message: 'Fase de diseño no encontrada',
        code: 1,
      });
    }

    const data: any = {};

    if (dto.codigo !== undefined) {
      const codigo = dto.codigo.trim().toUpperCase();
      const duplicated = await this.prisma.designPhase.findFirst({
        where: { codigo, NOT: { id } },
      });
      if (duplicated) {
        throw new ConflictException({
          message: 'El código ya está en uso',
          code: 1,
        });
      }
      data.codigo = codigo;
    }

    if (dto.nombre !== undefined) data.nombre = dto.nombre.trim();
    if (dto.descripcion !== undefined)
      data.descripcion = dto.descripcion.trim();
    if (dto.orden !== undefined) data.orden = dto.orden;
    if (dto.activo !== undefined) data.activo = dto.activo;

    if (Object.keys(data).length === 0) {
      return {
        res: existing,
        code: 0,
        message: 'No hay cambios para actualizar',
      };
    }

    const res = await this.prisma.designPhase.update({ where: { id }, data });

    return {
      res,
      code: 0,
      message: 'Fase de diseño actualizada correctamente',
    };
  }
}
