import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { Matriz2x2AnalyzeService } from './matriz-2x2-analyze.service';
import { Matriz2x2AnalyzeReqDto } from './dto/matriz-2x2-analyze.req.dto';
import { Matriz2x2AnalyzeResDto } from './dto/matriz-2x2-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / matriz-2x2')
@Controller('tool-hub/matriz-2x2')
export class Matriz2x2Controller {
  constructor(private readonly analyzeService: Matriz2x2AnalyzeService) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un análisis AI de la Matriz 2×2' })
  @ApiResponse({ status: 201, type: Matriz2x2AnalyzeResDto })
  analyze(
    @Body() dto: Matriz2x2AnalyzeReqDto,
  ): Promise<Matriz2x2AnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
