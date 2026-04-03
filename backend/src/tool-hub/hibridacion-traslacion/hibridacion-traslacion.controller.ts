import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { HibridacionTraslacionAnalyzeService } from './hibridacion-traslacion-analyze.service';
import { HibridacionTraslacionAnalyzeReqDto } from './dto/hibridacion-traslacion-analyze.req.dto';
import { HibridacionTraslacionAnalyzeResDto } from './dto/hibridacion-traslacion-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / hibridacion-traslacion')
@Controller('tool-hub/hibridacion-traslacion')
export class HibridacionTraslacionController {
  constructor(private readonly analyzeService: HibridacionTraslacionAnalyzeService) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un análisis AI de la Hibridación por Traslación' })
  @ApiResponse({ status: 201, type: HibridacionTraslacionAnalyzeResDto })
  analyze(@Body() dto: HibridacionTraslacionAnalyzeReqDto): Promise<HibridacionTraslacionAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
