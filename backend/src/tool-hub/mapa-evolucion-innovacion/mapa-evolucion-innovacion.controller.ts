import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { MapaEvolucionInnovacionAnalyzeService } from './mapa-evolucion-innovacion-analyze.service';
import { MapaEvolucionInnovacionAnalyzeReqDto } from './dto/mapa-evolucion-innovacion-analyze.req.dto';
import { MapaEvolucionInnovacionAnalyzeResDto } from './dto/mapa-evolucion-innovacion-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / mapa-evolucion-innovacion')
@Controller('tool-hub/mapa-evolucion-innovacion')
export class MapaEvolucionInnovacionController {
  constructor(private readonly analyzeService: MapaEvolucionInnovacionAnalyzeService) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un análisis AI del Mapa de Evolución e Innovación' })
  @ApiResponse({ status: 201, type: MapaEvolucionInnovacionAnalyzeResDto })
  analyze(@Body() dto: MapaEvolucionInnovacionAnalyzeReqDto): Promise<MapaEvolucionInnovacionAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
