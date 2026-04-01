import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { RolePlayChatService } from './role-play-chat.service';
import { RolePlayAnalyzeService } from './role-play-analyze.service';
import { RolePlayChatReqDto, RolePlayAnalyzeReqDto } from './dto/role-play.req.dto';
import { RolePlayChatResDto, RolePlayAnalyzeResDto } from './dto/role-play.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / role-play')
@Controller('tool-hub/role-play')
export class RolePlayController {
  constructor(
    private readonly chatService: RolePlayChatService,
    private readonly analyzeService: RolePlayAnalyzeService,
  ) {}

  @Post('chat')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Ejecuta un turno de simulación de Role Play facilitado por IA' })
  @ApiResponse({ status: 201, type: RolePlayChatResDto })
  chat(@Body() dto: RolePlayChatReqDto): Promise<RolePlayChatResDto> {
    return this.chatService.execute(dto);
  }

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera el análisis final de una sesión de Role Play' })
  @ApiResponse({ status: 201, type: RolePlayAnalyzeResDto })
  analyze(@Body() dto: RolePlayAnalyzeReqDto): Promise<RolePlayAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
