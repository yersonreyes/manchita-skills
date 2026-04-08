import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { BuzzReportAnalyzeService } from './buzz-report-analyze.service';
import { BuzzReportAnalyzeReqDto } from './dto/buzz-report-analyze.req.dto';
import { BuzzReportAnalyzeResDto } from './dto/buzz-report-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / buzz-report')
@Controller('tool-hub/buzz-report')
export class BuzzReportController {
  constructor(private readonly analyzeService: BuzzReportAnalyzeService) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un Buzz Report con análisis AI' })
  @ApiResponse({ status: 201, type: BuzzReportAnalyzeResDto })
  analyze(
    @Body() dto: BuzzReportAnalyzeReqDto,
  ): Promise<BuzzReportAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
