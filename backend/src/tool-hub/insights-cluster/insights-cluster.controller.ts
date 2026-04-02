import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { InsightsClusterAnalyzeService } from './insights-cluster-analyze.service';
import { InsightsClusterAnalyzeReqDto } from './dto/insights-cluster-analyze.req.dto';
import { InsightsClusterAnalyzeResDto } from './dto/insights-cluster-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / insights-cluster')
@Controller('tool-hub/insights-cluster')
export class InsightsClusterController {
  constructor(private readonly analyzeService: InsightsClusterAnalyzeService) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un análisis AI del Insights Cluster' })
  @ApiResponse({ status: 201, type: InsightsClusterAnalyzeResDto })
  analyze(@Body() dto: InsightsClusterAnalyzeReqDto): Promise<InsightsClusterAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
