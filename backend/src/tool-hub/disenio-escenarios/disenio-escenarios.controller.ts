import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { DisenioEscenariosAnalyzeService } from './disenio-escenarios-analyze.service';
import { DisenioEscenariosAnalyzeReqDto } from './dto/disenio-escenarios-analyze.req.dto';
import { DisenioEscenariosAnalyzeResDto } from './dto/disenio-escenarios-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / disenio-escenarios')
@Controller('tool-hub/disenio-escenarios')
export class DisenioEscenariosController {
  constructor(
    private readonly analyzeService: DisenioEscenariosAnalyzeService,
  ) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un análisis AI del Diseño de Escenarios' })
  @ApiResponse({ status: 201, type: DisenioEscenariosAnalyzeResDto })
  analyze(
    @Body() dto: DisenioEscenariosAnalyzeReqDto,
  ): Promise<DisenioEscenariosAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
