import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { InvestigacionRemotaAnalyzeService } from './investigacion-remota-analyze.service';
import { InvestigacionRemotaAnalyzeReqDto } from './dto/investigacion-remota-analyze.req.dto';
import { InvestigacionRemotaAnalyzeResDto } from './dto/investigacion-remota-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / investigacion-remota')
@Controller('tool-hub/investigacion-remota')
export class InvestigacionRemotaController {
  constructor(
    private readonly analyzeService: InvestigacionRemotaAnalyzeService,
  ) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un análisis AI de Investigación Remota' })
  @ApiResponse({ status: 201, type: InvestigacionRemotaAnalyzeResDto })
  analyze(
    @Body() dto: InvestigacionRemotaAnalyzeReqDto,
  ): Promise<InvestigacionRemotaAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
