import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  UpdateRolePermissionsRequestDto,
  UpdateUserPermissionOverrideRequestDto,
} from './dto/permission.req.dto';

@Injectable()
export class PermissionService {
  constructor(private prisma: PrismaService) {}

  // ─── PERMISOS EFECTIVOS DEL USUARIO ──────────────────────────────────────
  async getUserEffectivePermissions(userId: number): Promise<string[]> {
    // 1. Obtener permisos de todos los roles del usuario
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    const rolePermissions = new Set<string>();
    for (const userRole of userRoles) {
      for (const rp of userRole.role.rolePermissions) {
        if (rp.permission.activo) {
          rolePermissions.add(rp.permission.codigo);
        }
      }
    }

    // 2. Obtener overrides individuales del usuario
    const overrides = await this.prisma.userPermission.findMany({
      where: { userId },
      include: { permission: true },
    });

    for (const override of overrides) {
      if (override.granted) {
        rolePermissions.add(override.permission.codigo);
      } else {
        rolePermissions.delete(override.permission.codigo);
      }
    }

    return Array.from(rolePermissions);
  }

  // ─── LISTAR PERMISOS ──────────────────────────────────────────────────────
  async findAllPermissions() {
    const res = await this.prisma.permission.findMany({
      orderBy: { codigo: 'asc' },
    });

    if (res.length === 0) {
      throw new NotFoundException({
        message: 'No se encontraron permisos',
        code: 1,
      });
    }

    return { res, code: 0, message: 'Permisos encontrados' };
  }

  // ─── LISTAR ROLES ─────────────────────────────────────────────────────────
  async findAllRoles() {
    const roles = await this.prisma.role.findMany({
      include: {
        rolePermissions: {
          include: { permission: true },
        },
      },
      orderBy: { codigo: 'asc' },
    });

    if (roles.length === 0) {
      throw new NotFoundException({
        message: 'No se encontraron roles',
        code: 1,
      });
    }

    const res = roles.map((role) => ({
      ...role,
      permissions: role.rolePermissions.map((rp) => rp.permission),
      rolePermissions: undefined,
    }));

    return { res, code: 0, message: 'Roles encontrados' };
  }

  // ─── ACTUALIZAR PERMISOS DE ROL ───────────────────────────────────────────
  async updateRolePermissions(dto: UpdateRolePermissionsRequestDto) {
    const role = await this.prisma.role.findUnique({
      where: { id: dto.roleId },
    });
    if (!role) {
      throw new NotFoundException({ message: 'Rol no encontrado', code: 1 });
    }

    // Eliminar permisos actuales del rol
    await this.prisma.rolePermission.deleteMany({
      where: { roleId: dto.roleId },
    });

    // Crear nuevas asignaciones
    for (const permissionId of dto.permissionIds) {
      await this.prisma.rolePermission.create({
        data: { roleId: dto.roleId, permissionId },
      });
    }

    const updatedRole = await this.prisma.role.findUnique({
      where: { id: dto.roleId },
      include: {
        rolePermissions: { include: { permission: true } },
      },
    });

    const res = {
      ...updatedRole,
      permissions: updatedRole.rolePermissions.map((rp) => rp.permission),
      rolePermissions: undefined,
    };

    return {
      res,
      code: 0,
      message: 'Permisos del rol actualizados correctamente',
    };
  }

  // ─── OVERRIDE INDIVIDUAL DE USUARIO ──────────────────────────────────────
  async setUserPermissionOverride(dto: UpdateUserPermissionOverrideRequestDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });
    if (!user) {
      throw new NotFoundException({
        message: 'Usuario no encontrado',
        code: 1,
      });
    }

    const permission = await this.prisma.permission.findUnique({
      where: { id: dto.permissionId },
    });
    if (!permission) {
      throw new NotFoundException({
        message: 'Permiso no encontrado',
        code: 1,
      });
    }

    const res = await this.prisma.userPermission.upsert({
      where: {
        userId_permissionId: {
          userId: dto.userId,
          permissionId: dto.permissionId,
        },
      },
      update: { granted: dto.granted },
      create: {
        userId: dto.userId,
        permissionId: dto.permissionId,
        granted: dto.granted,
      },
      include: { permission: true },
    });

    return {
      res,
      code: 0,
      message: `Override ${dto.granted ? 'concedido' : 'denegado'} correctamente`,
    };
  }
}
