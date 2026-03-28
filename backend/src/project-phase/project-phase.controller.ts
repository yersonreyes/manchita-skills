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
  CreateProjectPhaseRequestDto,
  UpdateProjectPhaseRequestDto,
} from './dto/project-phase.req.dto';
import {
  ErrorResponseDto,
  GetAllProjectPhasesResponseDto,
  ProjectPhaseResponseDto,
} from './dto/project-phase.res.dto';
import { ProjectPhaseService } from './project-phase.service';

@ApiBearerAuth('access-token')
@ApiTags('project-phase')
@Controller('project-phase')
export class ProjectPhaseController {
  constructor(private readonly service: ProjectPhaseService) {}

  // ─── CREATE ───────────────────────────────────────────────────────────────
  @Post('create')
  @RequirePermission('project-phases:create')
  @ApiOperation({ summary: 'Crea una fase dentro de un proyecto' })
  @ApiBody({ type: CreateProjectPhaseRequestDto })
  @ApiResponse({ status: 201, type: ProjectPhaseResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  @ApiResponse({ status: 409, type: ErrorResponseDto })
  create(@Body() dto: CreateProjectPhaseRequestDto) {
    return this.service.create(dto);
  }

  // ─── READ BY PROJECT ──────────────────────────────────────────────────────
  @Get('project/:projectId')
  @RequirePermission('project-phases:read')
  @ApiOperation({ summary: 'Obtiene las fases de un proyecto' })
  @ApiResponse({ status: 200, type: GetAllProjectPhasesResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  findByProject(@Param('projectId') projectId: string) {
    return this.service.findByProject(+projectId);
  }

  // ─── READ ONE ─────────────────────────────────────────────────────────────
  @Get(':id')
  @RequirePermission('project-phases:read')
  @ApiOperation({ summary: 'Obtiene una fase de proyecto por ID' })
  @ApiResponse({ status: 200, type: ProjectPhaseResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  @Patch(':id')
  @RequirePermission('project-phases:update')
  @ApiOperation({ summary: 'Actualiza una fase de proyecto' })
  @ApiBody({ type: UpdateProjectPhaseRequestDto })
  @ApiResponse({ status: 200, type: ProjectPhaseResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  update(@Param('id') id: string, @Body() dto: UpdateProjectPhaseRequestDto) {
    return this.service.update(+id, dto);
  }
}
