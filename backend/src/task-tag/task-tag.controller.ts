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
  CreateTaskTagRequestDto,
  UpdateTaskTagRequestDto,
} from './dto/task-tag.req.dto';
import {
  TaskTagListResponseDto,
  TaskTagResponseDto,
} from './dto/task-tag.res.dto';
import { TaskTagService } from './task-tag.service';

@ApiBearerAuth('access-token')
@ApiTags('task-tag')
@Controller('task-tag')
export class TaskTagController {
  constructor(private readonly service: TaskTagService) {}

  @Post('create')
  @RequirePermission('projects:update')
  @ApiOperation({ summary: 'Crea una etiqueta de tarea' })
  @ApiBody({ type: CreateTaskTagRequestDto })
  @ApiResponse({ status: 201, type: TaskTagResponseDto })
  create(@Body() dto: CreateTaskTagRequestDto) {
    return this.service.create(dto);
  }

  @Get('project/:projectId')
  @RequirePermission('projects:read')
  @ApiOperation({ summary: 'Obtiene las etiquetas de un proyecto' })
  @ApiResponse({ status: 200, type: TaskTagListResponseDto })
  findByProject(@Param('projectId') projectId: string) {
    return this.service.findByProject(+projectId);
  }

  @Patch(':id')
  @RequirePermission('projects:update')
  @ApiOperation({ summary: 'Actualiza una etiqueta' })
  @ApiBody({ type: UpdateTaskTagRequestDto })
  @ApiResponse({ status: 200, type: TaskTagResponseDto })
  update(@Param('id') id: string, @Body() dto: UpdateTaskTagRequestDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @RequirePermission('projects:update')
  @ApiOperation({ summary: 'Elimina una etiqueta' })
  delete(@Param('id') id: string) {
    return this.service.delete(+id);
  }
}
