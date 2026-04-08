import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { ProjectBriefChatService } from './project-brief-chat.service';
import { ProjectBriefGenerateService } from './project-brief-generate.service';
import {
  ProjectBriefChatReqDto,
  ProjectBriefGenerateReqDto,
} from './dto/project-brief.req.dto';
import {
  ProjectBriefChatResDto,
  ProjectBriefGenerateResDto,
} from './dto/project-brief.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / project-brief')
@Controller('tool-hub/project-brief')
export class ProjectBriefController {
  constructor(
    private readonly chatService: ProjectBriefChatService,
    private readonly generateService: ProjectBriefGenerateService,
  ) {}

  @Post('chat')
  @RequirePermission('projects:update')
  @ApiOperation({
    summary:
      'Ejecuta un turno de conversación para descubrir el contexto del proyecto',
  })
  @ApiResponse({ status: 201, type: ProjectBriefChatResDto })
  chat(@Body() dto: ProjectBriefChatReqDto): Promise<ProjectBriefChatResDto> {
    return this.chatService.execute(dto);
  }

  @Post('generate')
  @RequirePermission('projects:update')
  @ApiOperation({
    summary: 'Sintetiza la conversación en un párrafo de contexto',
  })
  @ApiResponse({ status: 201, type: ProjectBriefGenerateResDto })
  generate(
    @Body() dto: ProjectBriefGenerateReqDto,
  ): Promise<ProjectBriefGenerateResDto> {
    return this.generateService.execute(dto);
  }
}
