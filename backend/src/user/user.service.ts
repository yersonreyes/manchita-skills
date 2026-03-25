import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AssignRolesRequestDto,
  CreateUserRequestDto,
  UpdateUserRequestDto,
} from './dto/user.req.dto';

// Selector que excluye el password de la respuesta
const USER_SELECT = {
  id: true,
  email: true,
  nombre: true,
  isSuperAdmin: true,
  activo: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // ─── CREATE ───────────────────────────────────────────────────────────────
  async create(dto: CreateUserRequestDto) {
    const email = dto.email.trim().toLowerCase();
    const nombre = dto.nombre.trim();

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException({ message: 'El email ya está registrado', code: 1 });
    }

    const password = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        nombre,
        password,
        isSuperAdmin: dto.isSuperAdmin ?? false,
        activo: dto.activo ?? true,
      },
      select: USER_SELECT,
    });

    return { res: user, code: 0, message: 'Usuario creado correctamente' };
  }

  // ─── FIND ALL ─────────────────────────────────────────────────────────────
  async findAll() {
    const res = await this.prisma.user.findMany({
      select: USER_SELECT,
      orderBy: { createdAt: 'desc' },
    });

    if (res.length === 0) {
      throw new NotFoundException({
        message: 'No se encontraron usuarios',
        code: 1,
      });
    }

    return { res, code: 0, message: 'Usuarios encontrados' };
  }

  // ─── FIND ONE ─────────────────────────────────────────────────────────────
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: Number(id) },
      select: USER_SELECT,
    });

    if (!user) {
      throw new NotFoundException({ message: 'Usuario no encontrado', code: 1 });
    }

    return { res: user, code: 0, message: 'Usuario encontrado' };
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  async update(id: number, dto: UpdateUserRequestDto) {
    const userId = Number(id);

    const existing = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
      throw new NotFoundException({ message: 'Usuario no encontrado', code: 1 });
    }

    const data: any = {};

    if (dto.email !== undefined) {
      const email = dto.email.trim().toLowerCase();
      const duplicated = await this.prisma.user.findFirst({
        where: { email, NOT: { id: userId } },
      });
      if (duplicated) {
        throw new ConflictException({ message: 'El email ya está en uso', code: 1 });
      }
      data.email = email;
    }

    if (dto.nombre !== undefined) data.nombre = dto.nombre.trim();
    if (dto.password !== undefined) data.password = await bcrypt.hash(dto.password, 10);
    if (dto.isSuperAdmin !== undefined) data.isSuperAdmin = dto.isSuperAdmin;
    if (dto.activo !== undefined) data.activo = dto.activo;

    if (Object.keys(data).length === 0) {
      const current = await this.prisma.user.findUnique({
        where: { id: userId },
        select: USER_SELECT,
      });
      return { res: current, code: 0, message: 'No hay cambios para actualizar' };
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: USER_SELECT,
    });

    return { res: updated, code: 0, message: 'Usuario actualizado correctamente' };
  }

  // ─── ASSIGN ROLES ─────────────────────────────────────────────────────────
  async assignRoles(userId: number, dto: AssignRolesRequestDto) {
    const user = await this.prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user) {
      throw new NotFoundException({ message: 'Usuario no encontrado', code: 1 });
    }

    // Eliminar roles actuales
    await this.prisma.userRole.deleteMany({ where: { userId: Number(userId) } });

    // Asignar nuevos roles
    for (const roleId of dto.roleIds) {
      await this.prisma.userRole.create({
        data: { userId: Number(userId), roleId },
      });
    }

    const updatedUser = await this.prisma.user.findUnique({
      where: { id: Number(userId) },
      select: {
        ...USER_SELECT,
        userRoles: { include: { role: true } },
      },
    });

    return {
      res: updatedUser,
      code: 0,
      message: 'Roles asignados correctamente',
    };
  }
}
