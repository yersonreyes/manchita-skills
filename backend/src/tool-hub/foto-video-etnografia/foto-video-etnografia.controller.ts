import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { FotoVideoEtnografiaAnalyzeService } from './foto-video-etnografia-analyze.service';
import { FotoVideoEtnografiaAnalyzeReqDto } from './dto/foto-video-etnografia-analyze.req.dto';
import { FotoVideoEtnografiaAnalyzeResDto } from './dto/foto-video-etnografia-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / foto-video-etnografia')
@Controller('tool-hub/foto-video-etnografia')
export class FotoVideoEtnografiaController {
  constructor(
    private readonly analyzeService: FotoVideoEtnografiaAnalyzeService,
  ) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un análisis AI de Foto-Vídeo Etnografía' })
  @ApiResponse({ status: 201, type: FotoVideoEtnografiaAnalyzeResDto })
  analyze(
    @Body() dto: FotoVideoEtnografiaAnalyzeReqDto,
  ): Promise<FotoVideoEtnografiaAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
