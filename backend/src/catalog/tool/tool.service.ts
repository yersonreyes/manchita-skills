import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AssignToolCategoriesRequestDto,
  CreateToolRequestDto,
  UpdateToolRequestDto,
} from './dto/tool.req.dto';

const TOOL_INCLUDE = {
  categories: {
    include: { category: true },
  },
};

@Injectable()
export class ToolService {
  constructor(private prisma: PrismaService) {}

  // ─── CREATE ───────────────────────────────────────────────────────────────
  async create(dto: CreateToolRequestDto) {
    const codigo = dto.codigo.trim().toUpperCase();
    const nombre = dto.nombre.trim();

    const existing = await this.prisma.tool.findUnique({ where: { codigo } });
    if (existing) {
      throw new ConflictException({ message: 'El código ya existe', code: 1 });
    }

    const res = await this.prisma.tool.create({
      data: {
        codigo,
        nombre,
        descripcion: dto.descripcion.trim(),
        comoSeUsa: dto.comoSeUsa?.trim() ?? null,
        ejemplo: dto.ejemplo?.trim() ?? null,
        cuandoUsarlo: dto.cuandoUsarlo?.trim() ?? null,
        activo: dto.activo ?? true,
      },
      include: TOOL_INCLUDE,
    });

    return { res, code: 0, message: 'Herramienta creada correctamente' };
  }

  // ─── FIND ALL ─────────────────────────────────────────────────────────────
  async findAll() {
    const res = await this.prisma.tool.findMany({
      include: TOOL_INCLUDE,
      orderBy: { codigo: 'asc' },
    });

    if (res.length === 0) {
      throw new NotFoundException({
        message: 'No se encontraron herramientas',
        code: 1,
      });
    }

    return { res, code: 0, message: 'Herramientas encontradas' };
  }

  // ─── FIND ONE ─────────────────────────────────────────────────────────────
  async findOne(id: number) {
    const res = await this.prisma.tool.findUnique({
      where: { id },
      include: TOOL_INCLUDE,
    });

    if (!res) {
      throw new NotFoundException({ message: 'Herramienta no encontrada', code: 1 });
    }

    return { res, code: 0, message: 'Herramienta encontrada' };
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  async update(id: number, dto: UpdateToolRequestDto) {
    const existing = await this.prisma.tool.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException({ message: 'Herramienta no encontrada', code: 1 });
    }

    const data: any = {};

    if (dto.codigo !== undefined) {
      const codigo = dto.codigo.trim().toUpperCase();
      const duplicated = await this.prisma.tool.findFirst({
        where: { codigo, NOT: { id } },
      });
      if (duplicated) {
        throw new ConflictException({ message: 'El código ya está en uso', code: 1 });
      }
      data.codigo = codigo;
    }

    if (dto.nombre !== undefined) data.nombre = dto.nombre.trim();
    if (dto.descripcion !== undefined) data.descripcion = dto.descripcion.trim();
    if (dto.comoSeUsa !== undefined) data.comoSeUsa = dto.comoSeUsa?.trim() ?? null;
    if (dto.ejemplo !== undefined) data.ejemplo = dto.ejemplo?.trim() ?? null;
    if (dto.cuandoUsarlo !== undefined) data.cuandoUsarlo = dto.cuandoUsarlo?.trim() ?? null;
    if (dto.activo !== undefined) data.activo = dto.activo;

    if (Object.keys(data).length === 0) {
      const current = await this.prisma.tool.findUnique({
        where: { id },
        include: TOOL_INCLUDE,
      });
      return { res: current, code: 0, message: 'No hay cambios para actualizar' };
    }

    const res = await this.prisma.tool.update({
      where: { id },
      data,
      include: TOOL_INCLUDE,
    });

    return { res, code: 0, message: 'Herramienta actualizada correctamente' };
  }

  // ─── ASSIGN CATEGORIES ────────────────────────────────────────────────────
  async assignCategories(id: number, dto: AssignToolCategoriesRequestDto) {
    const tool = await this.prisma.tool.findUnique({ where: { id } });
    if (!tool) {
      throw new NotFoundException({ message: 'Herramienta no encontrada', code: 1 });
    }

    // Eliminar categorías actuales
    await this.prisma.toolCategoryTool.deleteMany({ where: { toolId: id } });

    // Asignar nuevas categorías
    for (const categoryId of dto.categoryIds) {
      await this.prisma.toolCategoryTool.create({
        data: { toolId: id, categoryId },
      });
    }

    const res = await this.prisma.tool.findUnique({
      where: { id },
      include: TOOL_INCLUDE,
    });

    return { res, code: 0, message: 'Categorías asignadas correctamente' };
  }
}
