import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { HibridacionAgregacionAnalyzeService } from './hibridacion-agregacion-analyze.service';
import { HibridacionAgregacionAnalyzeReqDto } from './dto/hibridacion-agregacion-analyze.req.dto';
import { HibridacionAgregacionAnalyzeResDto } from './dto/hibridacion-agregacion-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / hibridacion-agregacion')
@Controller('tool-hub/hibridacion-agregacion')
export class HibridacionAgregacionController {
  constructor(private readonly analyzeService: HibridacionAgregacionAnalyzeService) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un análisis AI de la Hibridación por Agregación' })
  @ApiResponse({ status: 201, type: HibridacionAgregacionAnalyzeResDto })
  analyze(@Body() dto: HibridacionAgregacionAnalyzeReqDto): Promise<HibridacionAgregacionAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
