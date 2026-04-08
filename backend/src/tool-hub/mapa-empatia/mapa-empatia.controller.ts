import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { MapaEmpatiaAnalyzeService } from './mapa-empatia-analyze.service';
import { MapaEmpatiaAnalyzeReqDto } from './dto/mapa-empatia-analyze.req.dto';
import { MapaEmpatiaAnalyzeResDto } from './dto/mapa-empatia-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / mapa-empatia')
@Controller('tool-hub/mapa-empatia')
export class MapaEmpatiaController {
  constructor(private readonly analyzeService: MapaEmpatiaAnalyzeService) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un informe AI del Mapa de Empatía' })
  @ApiResponse({ status: 201, type: MapaEmpatiaAnalyzeResDto })
  analyze(
    @Body() dto: MapaEmpatiaAnalyzeReqDto,
  ): Promise<MapaEmpatiaAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
