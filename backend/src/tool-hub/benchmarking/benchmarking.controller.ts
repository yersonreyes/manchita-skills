import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { BenchmarkingAnalyzeService } from './benchmarking-analyze.service';
import { BenchmarkingAnalyzeReqDto } from './dto/benchmarking-analyze.req.dto';
import { BenchmarkingAnalyzeResDto } from './dto/benchmarking-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / benchmarking')
@Controller('tool-hub/benchmarking')
export class BenchmarkingController {
  constructor(private readonly analyzeService: BenchmarkingAnalyzeService) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un análisis AI de Benchmarking' })
  @ApiResponse({ status: 201, type: BenchmarkingAnalyzeResDto })
  analyze(
    @Body() dto: BenchmarkingAnalyzeReqDto,
  ): Promise<BenchmarkingAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
