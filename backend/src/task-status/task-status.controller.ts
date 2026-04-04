import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermission } from 'src/auth/decorators';
import {
  CreateTaskStatusRequestDto,
  UpdateTaskStatusRequestDto,
} from './dto/task-status.req.dto';
import {
  TaskStatusListResponseDto,
  TaskStatusResponseDto,
} from './dto/task-status.res.dto';
import { TaskStatusService } from './task-status.service';

@ApiBearerAuth('access-token')
@ApiTags('task-status')
@Controller('task-status')
export class TaskStatusController {
  constructor(private readonly service: TaskStatusService) {}

  @Post('create')
  @RequirePermission('projects:update')
  @ApiOperation({ summary: 'Crea un estado de tarea (columna Kanban)' })
  @ApiBody({ type: CreateTaskStatusRequestDto })
  @ApiResponse({ status: 201, type: TaskStatusResponseDto })
  create(@Body() dto: CreateTaskStatusRequestDto) {
    return this.service.create(dto);
  }

  @Get('project/:projectId')
  @RequirePermission('projects:read')
  @ApiOperation({ summary: 'Obtiene los estados de tarea de un proyecto' })
  @ApiResponse({ status: 200, type: TaskStatusListResponseDto })
  findByProject(@Param('projectId') projectId: string) {
    return this.service.findByProject(+projectId);
  }

  @Patch(':id')
  @RequirePermission('projects:update')
  @ApiOperation({ summary: 'Actualiza un estado de tarea' })
  @ApiBody({ type: UpdateTaskStatusRequestDto })
  @ApiResponse({ status: 200, type: TaskStatusResponseDto })
  update(@Param('id') id: string, @Body() dto: UpdateTaskStatusRequestDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @RequirePermission('projects:update')
  @ApiOperation({ summary: 'Elimina un estado de tarea' })
  delete(@Param('id') id: string) {
    return this.service.delete(+id);
  }
}
