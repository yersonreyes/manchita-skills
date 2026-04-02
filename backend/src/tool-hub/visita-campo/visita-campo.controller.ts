import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { VisitaCampoAnalyzeService } from './visita-campo-analyze.service';
import { VisitaCampoAnalyzeReqDto } from './dto/visita-campo-analyze.req.dto';
import { VisitaCampoAnalyzeResDto } from './dto/visita-campo-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / visita-campo')
@Controller('tool-hub/visita-campo')
export class VisitaCampoController {
  constructor(private readonly analyzeService: VisitaCampoAnalyzeService) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un análisis AI de Visita de Campo' })
  @ApiResponse({ status: 201, type: VisitaCampoAnalyzeResDto })
  analyze(@Body() dto: VisitaCampoAnalyzeReqDto): Promise<VisitaCampoAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
