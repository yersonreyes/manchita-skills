import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { MapaConvergenciaAnalyzeService } from './mapa-convergencia-analyze.service';
import { MapaConvergenciaAnalyzeReqDto } from './dto/mapa-convergencia-analyze.req.dto';
import { MapaConvergenciaAnalyzeResDto } from './dto/mapa-convergencia-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / mapa-convergencia')
@Controller('tool-hub/mapa-convergencia')
export class MapaConvergenciaController {
  constructor(
    private readonly analyzeService: MapaConvergenciaAnalyzeService,
  ) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un análisis AI del Mapa de Convergencia' })
  @ApiResponse({ status: 201, type: MapaConvergenciaAnalyzeResDto })
  analyze(
    @Body() dto: MapaConvergenciaAnalyzeReqDto,
  ): Promise<MapaConvergenciaAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
