import { Body, Controller, Get, Patch } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermission } from 'src/auth/decorators';
import {
  UpdateRolePermissionsRequestDto,
  UpdateUserPermissionOverrideRequestDto,
} from './dto/permission.req.dto';
import {
  ErrorResponseDto,
  GetAllPermissionsResponseDto,
  GetAllRolesResponseDto,
  RoleResponseDto,
} from './dto/permission.res.dto';
import { PermissionService } from './permission.service';

@ApiBearerAuth('access-token')
@ApiTags('permission')
@Controller('permission')
export class PermissionController {
  constructor(private readonly service: PermissionService) {}

  // ─── LISTAR TODOS LOS PERMISOS ────────────────────────────────────────────
  @Get('all')
  @RequirePermission('permissions:read')
  @ApiOperation({ summary: 'Obtiene todos los permisos del sistema' })
  @ApiResponse({ status: 200, type: GetAllPermissionsResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  findAllPermissions() {
    return this.service.findAllPermissions();
  }

  // ─── LISTAR TODOS LOS ROLES ───────────────────────────────────────────────
  @Get('roles')
  @RequirePermission('permissions:read')
  @ApiOperation({ summary: 'Obtiene todos los roles con sus permisos' })
  @ApiResponse({ status: 200, type: GetAllRolesResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  findAllRoles() {
    return this.service.findAllRoles();
  }

  // ─── ACTUALIZAR PERMISOS DE ROL ───────────────────────────────────────────
  @Patch('role-permissions')
  @RequirePermission('permissions:update')
  @ApiOperation({ summary: 'Actualiza los permisos asignados a un rol' })
  @ApiBody({ type: UpdateRolePermissionsRequestDto })
  @ApiResponse({ status: 200, type: RoleResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  updateRolePermissions(@Body() dto: UpdateRolePermissionsRequestDto) {
    return this.service.updateRolePermissions(dto);
  }

  // ─── OVERRIDE INDIVIDUAL DE USUARIO ──────────────────────────────────────
  @Patch('user-override')
  @RequirePermission('permissions:update')
  @ApiOperation({ summary: 'Concede o deniega un permiso específico a un usuario' })
  @ApiBody({ type: UpdateUserPermissionOverrideRequestDto })
  @ApiResponse({ status: 200, type: RoleResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  setUserPermissionOverride(@Body() dto: UpdateUserPermissionOverrideRequestDto) {
    return this.service.setUserPermissionOverride(dto);
  }
}
