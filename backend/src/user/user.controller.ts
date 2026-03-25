import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermission } from 'src/auth/decorators';
import {
  AssignRolesRequestDto,
  CreateUserRequestDto,
  UpdateUserRequestDto,
} from './dto/user.req.dto';
import {
  ErrorResponseDto,
  GetAllUsersResponseDto,
  UserResponseDto,
} from './dto/user.res.dto';
import { UserService } from './user.service';

@ApiBearerAuth('access-token')
@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly service: UserService) {}

  // ─── CREATE ───────────────────────────────────────────────────────────────
  @Post('create')
  @RequirePermission('users:create')
  @ApiOperation({ summary: 'Crea un nuevo usuario' })
  @ApiBody({ type: CreateUserRequestDto })
  @ApiResponse({ status: 201, type: UserResponseDto })
  @ApiResponse({ status: 409, type: ErrorResponseDto })
  create(@Body() dto: CreateUserRequestDto) {
    return this.service.create(dto);
  }

  // ─── READ ALL ─────────────────────────────────────────────────────────────
  @Get('all')
  @RequirePermission('users:read')
  @ApiOperation({ summary: 'Obtiene todos los usuarios' })
  @ApiResponse({ status: 200, type: GetAllUsersResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  findAll() {
    return this.service.findAll();
  }

  // ─── READ ONE ─────────────────────────────────────────────────────────────
  @Get(':id')
  @RequirePermission('users:read')
  @ApiOperation({ summary: 'Obtiene un usuario por ID' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  @Patch(':id')
  @RequirePermission('users:update')
  @ApiOperation({ summary: 'Actualiza un usuario' })
  @ApiBody({ type: UpdateUserRequestDto })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  @ApiResponse({ status: 409, type: ErrorResponseDto })
  update(@Param('id') id: string, @Body() dto: UpdateUserRequestDto) {
    return this.service.update(+id, dto);
  }

  // ─── ASSIGN ROLES ─────────────────────────────────────────────────────────
  @Patch(':id/roles')
  @RequirePermission('users:update')
  @ApiOperation({ summary: 'Asigna roles a un usuario' })
  @ApiBody({ type: AssignRolesRequestDto })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  assignRoles(@Param('id') id: string, @Body() dto: AssignRolesRequestDto) {
    return this.service.assignRoles(+id, dto);
  }
}
