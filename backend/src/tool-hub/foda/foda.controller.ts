import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { FodaAnalyzeService } from './foda-analyze.service';
import { FodaAnalyzeReqDto } from './dto/foda-analyze.req.dto';
import { FodaAnalyzeResDto } from './dto/foda-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / foda')
@Controller('tool-hub/foda')
export class FodaController {
  constructor(private readonly analyzeService: FodaAnalyzeService) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un informe AI del análisis FODA' })
  @ApiResponse({ status: 201, type: FodaAnalyzeResDto })
  analyze(@Body() dto: FodaAnalyzeReqDto): Promise<FodaAnalyzeResDto> {
    return this.analyzeService.execute(dto, dto.currentVersion);
  }
}
