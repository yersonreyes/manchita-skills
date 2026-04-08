import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { StakeholderMapAnalyzeService } from './stakeholder-map-analyze.service';
import { StakeholderMapAnalyzeReqDto } from './dto/stakeholder-map-analyze.req.dto';
import { StakeholderMapAnalyzeResDto } from './dto/stakeholder-map-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / stakeholder-map')
@Controller('tool-hub/stakeholder-map')
export class StakeholderMapController {
  constructor(private readonly analyzeService: StakeholderMapAnalyzeService) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un informe AI del Stakeholder Map' })
  @ApiResponse({ status: 201, type: StakeholderMapAnalyzeResDto })
  analyze(
    @Body() dto: StakeholderMapAnalyzeReqDto,
  ): Promise<StakeholderMapAnalyzeResDto> {
    return this.analyzeService.execute(dto, dto.currentVersion);
  }
}
