import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { PoemsAnalyzeService } from './poems-analyze.service';
import { PoemsAnalyzeReqDto } from './dto/poems-analyze.req.dto';
import { PoemsAnalyzeResDto } from './dto/poems-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / poems')
@Controller('tool-hub/poems')
export class PoemsController {
  constructor(private readonly analyzeService: PoemsAnalyzeService) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un análisis AI de POEMS' })
  @ApiResponse({ status: 201, type: PoemsAnalyzeResDto })
  analyze(@Body() dto: PoemsAnalyzeReqDto): Promise<PoemsAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
