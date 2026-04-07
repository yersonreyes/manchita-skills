import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirementPriority, RequirementStatus, RequirementType } from '@prisma/client';
import { RequirePermission } from '../auth/decorators';
import {
  ChangeRequirementStatusReqDto,
  CreateRequirementReqDto,
  UpdateRequirementReqDto,
} from './dto/requirement.req.dto';
import { RequirementResDto } from './dto/requirement.res.dto';
import { RequirementService } from './requirement.service';

@ApiBearerAuth('access-token')
@ApiTags('requirements')
@Controller('projects/:projectId/requirements')
export class RequirementController {
  constructor(private readonly requirementService: RequirementService) {}

  @Get()
  @RequirePermission('requirements:read')
  @ApiOperation({ summary: 'Listar requisitos del proyecto' })
  @ApiQuery({ name: 'type', enum: RequirementType, required: false })
  @ApiQuery({ name: 'status', enum: RequirementStatus, required: false })
  @ApiQuery({ name: 'priority', enum: RequirementPriority, required: false })
  @ApiResponse({ status: 200, type: [RequirementResDto] })
  findAll(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query('type') type?: RequirementType,
    @Query('status') status?: RequirementStatus,
    @Query('priority') priority?: RequirementPriority,
  ) {
    return this.requirementService.findAll(projectId, { type, status, priority });
  }

  @Get(':id')
  @RequirePermission('requirements:read')
  @ApiOperation({ summary: 'Obtener un requisito' })
  @ApiResponse({ status: 200, type: RequirementResDto })
  findOne(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.requirementService.findOne(projectId, id);
  }

  @Post()
  @RequirePermission('requirements:create')
  @ApiOperation({ summary: 'Crear un requisito' })
  @ApiResponse({ status: 201, type: RequirementResDto })
  create(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: CreateRequirementReqDto,
    @Request() req,
  ) {
    return this.requirementService.create(projectId, dto, req.user.userId);
  }

  @Patch(':id')
  @RequirePermission('requirements:update')
  @ApiOperation({ summary: 'Actualizar un requisito' })
  @ApiResponse({ status: 200, type: RequirementResDto })
  update(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRequirementReqDto,
    @Request() req,
  ) {
    return this.requirementService.update(projectId, id, dto, req.user.userId);
  }

  @Patch(':id/status')
  @RequirePermission('requirements:status')
  @ApiOperation({ summary: 'Cambiar estado de un requisito (solo OWNER/EDITOR del proyecto)' })
  @ApiResponse({ status: 200, type: RequirementResDto })
  changeStatus(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ChangeRequirementStatusReqDto,
    @Request() req,
  ) {
    return this.requirementService.changeStatus(projectId, id, dto, req.user.userId);
  }

  @Delete(':id')
  @RequirePermission('requirements:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar (soft delete) un requisito' })
  remove(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.requirementService.remove(projectId, id);
  }
}
