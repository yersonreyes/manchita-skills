import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermission } from 'src/auth/decorators';
import {
  AssignTagRequestDto,
  CreateTaskRequestDto,
  MoveTaskRequestDto,
  ReorderTaskRequestDto,
  UpdateTaskRequestDto,
} from './dto/task.req.dto';
import { TaskListResponseDto, TaskResponseDto } from './dto/task.res.dto';
import { TaskService } from './task.service';

@ApiBearerAuth('access-token')
@ApiTags('task')
@Controller('task')
export class TaskController {
  constructor(private readonly service: TaskService) {}

  @Post('create')
  @RequirePermission('projects:update')
  @ApiOperation({ summary: 'Crea una tarea' })
  @ApiBody({ type: CreateTaskRequestDto })
  @ApiResponse({ status: 201, type: TaskResponseDto })
  create(@Body() dto: CreateTaskRequestDto, @Request() req) {
    return this.service.create(dto, req.user.userId);
  }

  @Get('project/:projectId')
  @RequirePermission('projects:read')
  @ApiOperation({ summary: 'Obtiene las tareas de un proyecto' })
  @ApiResponse({ status: 200, type: TaskListResponseDto })
  findByProject(
    @Param('projectId') projectId: string,
    @Query('statusId') statusId?: string,
    @Query('assigneeId') assigneeId?: string,
    @Query('prioridad') prioridad?: string,
    @Query('tagId') tagId?: string,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
  ) {
    return this.service.findByProject(+projectId, {
      statusId: statusId ? +statusId : undefined,
      assigneeId: assigneeId ? +assigneeId : undefined,
      prioridad: prioridad || undefined,
      tagId: tagId ? +tagId : undefined,
      fechaDesde: fechaDesde || undefined,
      fechaHasta: fechaHasta || undefined,
    });
  }

  @Get(':id')
  @RequirePermission('projects:read')
  @ApiOperation({ summary: 'Obtiene una tarea por ID' })
  @ApiResponse({ status: 200, type: TaskResponseDto })
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  @RequirePermission('projects:update')
  @ApiOperation({ summary: 'Actualiza una tarea' })
  @ApiBody({ type: UpdateTaskRequestDto })
  @ApiResponse({ status: 200, type: TaskResponseDto })
  update(@Param('id') id: string, @Body() dto: UpdateTaskRequestDto, @Request() req) {
    return this.service.update(+id, dto, req.user.userId);
  }

  @Patch(':id/move')
  @RequirePermission('projects:update')
  @ApiOperation({ summary: 'Mueve una tarea (Kanban drag-drop)' })
  @ApiBody({ type: MoveTaskRequestDto })
  @ApiResponse({ status: 200, type: TaskResponseDto })
  move(@Param('id') id: string, @Body() dto: MoveTaskRequestDto, @Request() req) {
    return this.service.move(+id, dto, req.user.userId);
  }

  @Patch(':id/reorder')
  @RequirePermission('projects:update')
  @ApiOperation({ summary: 'Reordena una tarea dentro de su columna' })
  @ApiBody({ type: ReorderTaskRequestDto })
  @ApiResponse({ status: 200, type: TaskResponseDto })
  reorder(@Param('id') id: string, @Body() dto: ReorderTaskRequestDto) {
    return this.service.reorder(+id, dto);
  }

  @Delete(':id')
  @RequirePermission('projects:update')
  @ApiOperation({ summary: 'Elimina una tarea (soft delete)' })
  delete(@Param('id') id: string, @Request() req) {
    return this.service.softDelete(+id, req.user.userId);
  }

  @Post(':id/tags')
  @RequirePermission('projects:update')
  @ApiOperation({ summary: 'Asigna una etiqueta a una tarea' })
  @ApiBody({ type: AssignTagRequestDto })
  @ApiResponse({ status: 201, type: TaskResponseDto })
  assignTag(@Param('id') id: string, @Body() dto: AssignTagRequestDto) {
    return this.service.assignTag(+id, dto);
  }

  @Delete(':id/tags/:tagId')
  @RequirePermission('projects:update')
  @ApiOperation({ summary: 'Remueve una etiqueta de una tarea' })
  removeTag(@Param('id') id: string, @Param('tagId') tagId: string) {
    return this.service.removeTag(+id, +tagId);
  }
}
