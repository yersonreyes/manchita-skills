import { Controller, Post, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { AiChatRequestDto, AiAnalyzeRequestDto } from './dto/ai.req.dto';
import { AiChatResDto, AiAnalyzeResDto } from './dto/ai.res.dto';
import { RequirePermission } from '../auth/decorators';

@ApiBearerAuth('access-token')
@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Envía un mensaje en la sesión AI' })
  @ApiResponse({
    status: 200,
    description: 'Respuesta del AI',
    type: AiChatResDto,
  })
  chat(@Body() dto: AiChatRequestDto): Promise<AiChatResDto> {
    return this.aiService.chat(dto);
  }

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Solicita análisis final de la sesión AI' })
  @ApiResponse({
    status: 200,
    description: 'Análisis estructurado',
    type: AiAnalyzeResDto,
  })
  analyze(@Body() dto: AiAnalyzeRequestDto): Promise<AiAnalyzeResDto> {
    return this.aiService.analyze(dto);
  }
}
