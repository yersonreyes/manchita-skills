import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermission } from 'src/auth/decorators';
import { TaskActivityListResponseDto } from './dto/task-activity.res.dto';
import { TaskActivityService } from './task-activity.service';

@ApiBearerAuth('access-token')
@ApiTags('task-activity')
@Controller('task-activity')
export class TaskActivityController {
  constructor(private readonly service: TaskActivityService) {}

  @Get('task/:taskId')
  @RequirePermission('projects:read')
  @ApiOperation({ summary: 'Obtiene el historial de una tarea' })
  @ApiResponse({ status: 200, type: TaskActivityListResponseDto })
  findByTask(
    @Param('taskId') taskId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findByTask(
      +taskId,
      page ? +page : 1,
      limit ? +limit : 20,
    );
  }

  @Get('project/:projectId')
  @RequirePermission('projects:read')
  @ApiOperation({ summary: 'Obtiene el historial de actividad de un proyecto' })
  @ApiResponse({ status: 200, type: TaskActivityListResponseDto })
  findByProject(
    @Param('projectId') projectId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findByProject(
      +projectId,
      page ? +page : 1,
      limit ? +limit : 20,
    );
  }
}
