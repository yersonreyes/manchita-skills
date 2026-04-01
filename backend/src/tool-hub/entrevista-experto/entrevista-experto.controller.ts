import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { EntrevistaExpertoAnalyzeService } from './entrevista-experto-analyze.service';
import { EntrevistaExpertoAnalyzeReqDto } from './dto/entrevista-experto-analyze.req.dto';
import { EntrevistaExpertoAnalyzeResDto } from './dto/entrevista-experto-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / entrevista-experto')
@Controller('tool-hub/entrevista-experto')
export class EntrevistaExpertoController {
  constructor(private readonly analyzeService: EntrevistaExpertoAnalyzeService) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un análisis AI de Entrevista con Experto' })
  @ApiResponse({ status: 201, type: EntrevistaExpertoAnalyzeResDto })
  analyze(@Body() dto: EntrevistaExpertoAnalyzeReqDto): Promise<EntrevistaExpertoAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
