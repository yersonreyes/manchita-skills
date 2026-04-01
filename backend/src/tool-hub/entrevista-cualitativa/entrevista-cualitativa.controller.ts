import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { EntrevistaCualitativaAnalyzeService } from './entrevista-cualitativa-analyze.service';
import { EntrevistaCualitativaAnalyzeReqDto } from './dto/entrevista-cualitativa-analyze.req.dto';
import { EntrevistaCualitativaAnalyzeResDto } from './dto/entrevista-cualitativa-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / entrevista-cualitativa')
@Controller('tool-hub/entrevista-cualitativa')
export class EntrevistaCualitativaController {
  constructor(private readonly analyzeService: EntrevistaCualitativaAnalyzeService) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un análisis AI de Entrevista Cualitativa' })
  @ApiResponse({ status: 201, type: EntrevistaCualitativaAnalyzeResDto })
  analyze(@Body() dto: EntrevistaCualitativaAnalyzeReqDto): Promise<EntrevistaCualitativaAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
