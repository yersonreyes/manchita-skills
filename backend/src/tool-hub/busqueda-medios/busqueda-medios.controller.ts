import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { BusquedaMediosAnalyzeService } from './busqueda-medios-analyze.service';
import { BusquedaMediosAnalyzeReqDto } from './dto/busqueda-medios-analyze.req.dto';
import { BusquedaMediosAnalyzeResDto } from './dto/busqueda-medios-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / busqueda-medios')
@Controller('tool-hub/busqueda-medios')
export class BusquedaMediosController {
  constructor(private readonly analyzeService: BusquedaMediosAnalyzeService) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un análisis AI de Búsqueda de Medios' })
  @ApiResponse({ status: 201, type: BusquedaMediosAnalyzeResDto })
  analyze(
    @Body() dto: BusquedaMediosAnalyzeReqDto,
  ): Promise<BusquedaMediosAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
