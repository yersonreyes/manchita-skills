import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { RoadmapPrototipadoAnalyzeService } from './roadmap-prototipado-analyze.service';
import { RoadmapPrototipadoAnalyzeReqDto } from './dto/roadmap-prototipado-analyze.req.dto';
import { RoadmapPrototipadoAnalyzeResDto } from './dto/roadmap-prototipado-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / roadmap-prototipado')
@Controller('tool-hub/roadmap-prototipado')
export class RoadmapPrototipadoController {
  constructor(private readonly analyzeService: RoadmapPrototipadoAnalyzeService) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un análisis AI del Roadmap de Prototipado' })
  @ApiResponse({ status: 201, type: RoadmapPrototipadoAnalyzeResDto })
  analyze(@Body() dto: RoadmapPrototipadoAnalyzeReqDto): Promise<RoadmapPrototipadoAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
