import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { AnalogosAntilogosAnalyzeService } from './analogos-antilogos-analyze.service';
import { AnalogosAntilogosAnalyzeReqDto } from './dto/analogos-antilogos-analyze.req.dto';
import { AnalogosAntilogosAnalyzeResDto } from './dto/analogos-antilogos-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / analogos-antilogos')
@Controller('tool-hub/analogos-antilogos')
export class AnalogosAntilogosController {
  constructor(private readonly analyzeService: AnalogosAntilogosAnalyzeService) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un informe AI de Análogos y Antilogos' })
  @ApiResponse({ status: 201, type: AnalogosAntilogosAnalyzeResDto })
  analyze(@Body() dto: AnalogosAntilogosAnalyzeReqDto): Promise<AnalogosAntilogosAnalyzeResDto> {
    return this.analyzeService.execute(dto, dto.currentVersion);
  }
}
