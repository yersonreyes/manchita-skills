import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { MatrizTendenciasAnalyzeService } from './matriz-tendencias-analyze.service';
import { MatrizTendenciasAnalyzeReqDto } from './dto/matriz-tendencias-analyze.req.dto';
import { MatrizTendenciasAnalyzeResDto } from './dto/matriz-tendencias-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / matriz-tendencias')
@Controller('tool-hub/matriz-tendencias')
export class MatrizTendenciasController {
  constructor(
    private readonly analyzeService: MatrizTendenciasAnalyzeService,
  ) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un análisis AI de la Matriz de Tendencias' })
  @ApiResponse({ status: 201, type: MatrizTendenciasAnalyzeResDto })
  analyze(
    @Body() dto: MatrizTendenciasAnalyzeReqDto,
  ): Promise<MatrizTendenciasAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
