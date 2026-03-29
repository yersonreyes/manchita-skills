import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { CincoPorquesChatService } from './cinco-porques-chat.service';
import { CincoPorquesAnalyzeService } from './cinco-porques-analyze.service';
import { CincoPorquesChatReqDto, CincoPorquesAnalyzeReqDto } from './dto/cinco-porques.req.dto';
import { CincoPorquesChatResDto, CincoPorquesAnalyzeResDto } from './dto/cinco-porques.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / cinco-porques')
@Controller('tool-hub/cinco-porques')
export class CincoPorquesController {
  constructor(
    private readonly chatService: CincoPorquesChatService,
    private readonly analyzeService: CincoPorquesAnalyzeService,
  ) {}

  @Post('chat')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Ejecuta un turno de conversación guiada con Los 5 Porqués' })
  @ApiResponse({ status: 201, type: CincoPorquesChatResDto })
  chat(@Body() dto: CincoPorquesChatReqDto): Promise<CincoPorquesChatResDto> {
    return this.chatService.execute(dto);
  }

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera el análisis final de una sesión de Los 5 Porqués' })
  @ApiResponse({ status: 201, type: CincoPorquesAnalyzeResDto })
  analyze(@Body() dto: CincoPorquesAnalyzeReqDto): Promise<CincoPorquesAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
