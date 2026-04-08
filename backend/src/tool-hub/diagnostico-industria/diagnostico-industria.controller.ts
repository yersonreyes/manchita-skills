import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { DiagnosticoIndustriaAnalyzeService } from './diagnostico-industria-analyze.service';
import { DiagnosticoIndustriaReqDto } from './dto/diagnostico-industria.req.dto';
import { DiagnosticoIndustriaResDto } from './dto/diagnostico-industria.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / diagnostico-industria')
@Controller('tool-hub/diagnostico-industria')
export class DiagnosticoIndustriaController {
  constructor(
    private readonly analyzeService: DiagnosticoIndustriaAnalyzeService,
  ) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({
    summary:
      'Genera un informe AI del diagnóstico de industria (5 Fuerzas de Porter)',
  })
  @ApiResponse({ status: 201, type: DiagnosticoIndustriaResDto })
  analyze(
    @Body() dto: DiagnosticoIndustriaReqDto,
  ): Promise<DiagnosticoIndustriaResDto> {
    return this.analyzeService.execute(dto);
  }
}
