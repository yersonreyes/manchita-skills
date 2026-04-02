import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { Perspectiva360AnalyzeService } from './perspectiva-360-analyze.service';
import { Perspectiva360AnalyzeReqDto } from './dto/perspectiva-360-analyze.req.dto';
import { Perspectiva360AnalyzeResDto } from './dto/perspectiva-360-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / perspectiva-360')
@Controller('tool-hub/perspectiva-360')
export class Perspectiva360Controller {
  constructor(private readonly analyzeService: Perspectiva360AnalyzeService) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un análisis AI de Perspectiva 360' })
  @ApiResponse({ status: 201, type: Perspectiva360AnalyzeResDto })
  analyze(@Body() dto: Perspectiva360AnalyzeReqDto): Promise<Perspectiva360AnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
