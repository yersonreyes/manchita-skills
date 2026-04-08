import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { SesionCocreacionAnalyzeService } from './sesion-cocreacion-analyze.service';
import { SesionCocreacionAnalyzeReqDto } from './dto/sesion-cocreacion-analyze.req.dto';
import { SesionCocreacionAnalyzeResDto } from './dto/sesion-cocreacion-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / sesion-cocreacion')
@Controller('tool-hub/sesion-cocreacion')
export class SesionCocreacionController {
  constructor(
    private readonly analyzeService: SesionCocreacionAnalyzeService,
  ) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un análisis AI de la Sesión de Cocreación' })
  @ApiResponse({ status: 201, type: SesionCocreacionAnalyzeResDto })
  analyze(
    @Body() dto: SesionCocreacionAnalyzeReqDto,
  ): Promise<SesionCocreacionAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
