import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermission } from 'src/auth/decorators';
import {
  CreateProjectRequestDto,
  UpdateProjectRequestDto,
  UpsertProjectMemberRequestDto,
} from './dto/project.req.dto';
import {
  ErrorResponseDto,
  GetAllProjectsResponseDto,
  ProjectResponseDto,
} from './dto/project.res.dto';
import { ProjectService } from './project.service';

@ApiBearerAuth('access-token')
@ApiTags('project')
@Controller('project')
export class ProjectController {
  constructor(private readonly service: ProjectService) {}

  // ─── CREATE ───────────────────────────────────────────────────────────────
  @Post('create')
  @RequirePermission('projects:create')
  @ApiOperation({ summary: 'Crea un nuevo proyecto' })
  @ApiBody({ type: CreateProjectRequestDto })
  @ApiResponse({ status: 201, type: ProjectResponseDto })
  create(@Body() dto: CreateProjectRequestDto, @Request() req) {
    return this.service.create(dto, req.user.userId);
  }

  // ─── READ ALL ─────────────────────────────────────────────────────────────
  @Get('all')
  @RequirePermission('projects:read')
  @ApiOperation({ summary: 'Obtiene todos los proyectos' })
  @ApiResponse({ status: 200, type: GetAllProjectsResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  findAll() {
    return this.service.findAll();
  }

  // ─── READ ONE ─────────────────────────────────────────────────────────────
  @Get(':id')
  @RequirePermission('projects:read')
  @ApiOperation({ summary: 'Obtiene un proyecto por ID' })
  @ApiResponse({ status: 200, type: ProjectResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  @Patch(':id')
  @RequirePermission('projects:update')
  @ApiOperation({ summary: 'Actualiza un proyecto' })
  @ApiBody({ type: UpdateProjectRequestDto })
  @ApiResponse({ status: 200, type: ProjectResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  update(@Param('id') id: string, @Body() dto: UpdateProjectRequestDto) {
    return this.service.update(+id, dto);
  }

  // ─── UPSERT MEMBER ────────────────────────────────────────────────────────
  @Patch(':id/members')
  @RequirePermission('projects:update')
  @ApiOperation({ summary: 'Añade o actualiza un miembro del proyecto' })
  @ApiBody({ type: UpsertProjectMemberRequestDto })
  @ApiResponse({ status: 200, type: ProjectResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  upsertMember(
    @Param('id') id: string,
    @Body() dto: UpsertProjectMemberRequestDto,
  ) {
    return this.service.upsertMember(+id, dto);
  }

  // ─── REMOVE MEMBER ────────────────────────────────────────────────────────
  @Delete(':projectId/members/:userId')
  @RequirePermission('projects:update')
  @ApiOperation({ summary: 'Elimina un miembro del proyecto' })
  @ApiResponse({ status: 200, type: ProjectResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  removeMember(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
  ) {
    return this.service.removeMember(+projectId, +userId);
  }
}
