import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { MapaActivoExperienciaAnalyzeService } from './mapa-activo-experiencia-analyze.service';
import { MapaActivoExperienciaAnalyzeReqDto } from './dto/mapa-activo-experiencia-analyze.req.dto';
import { MapaActivoExperienciaAnalyzeResDto } from './dto/mapa-activo-experiencia-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / mapa-activo-experiencia')
@Controller('tool-hub/mapa-activo-experiencia')
export class MapaActivoExperienciaController {
  constructor(
    private readonly analyzeService: MapaActivoExperienciaAnalyzeService,
  ) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({
    summary: 'Genera un análisis AI del Mapa Activo de la Experiencia',
  })
  @ApiResponse({ status: 201, type: MapaActivoExperienciaAnalyzeResDto })
  analyze(
    @Body() dto: MapaActivoExperienciaAnalyzeReqDto,
  ): Promise<MapaActivoExperienciaAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
