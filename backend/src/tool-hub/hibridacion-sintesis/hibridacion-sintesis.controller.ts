import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { HibridacionSintesisAnalyzeService } from './hibridacion-sintesis-analyze.service';
import { HibridacionSintesisAnalyzeReqDto } from './dto/hibridacion-sintesis-analyze.req.dto';
import { HibridacionSintesisAnalyzeResDto } from './dto/hibridacion-sintesis-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / hibridacion-sintesis')
@Controller('tool-hub/hibridacion-sintesis')
export class HibridacionSintesisController {
  constructor(
    private readonly analyzeService: HibridacionSintesisAnalyzeService,
  ) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({
    summary: 'Genera un análisis AI de la Hibridación por Síntesis',
  })
  @ApiResponse({ status: 201, type: HibridacionSintesisAnalyzeResDto })
  analyze(
    @Body() dto: HibridacionSintesisAnalyzeReqDto,
  ): Promise<HibridacionSintesisAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
