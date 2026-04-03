import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { WhatIfAnalyzeService } from './what-if-analyze.service';
import { WhatIfAnalyzeReqDto } from './dto/what-if-analyze.req.dto';
import { WhatIfAnalyzeResDto } from './dto/what-if-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / what-if')
@Controller('tool-hub/what-if')
export class WhatIfController {
  constructor(private readonly analyzeService: WhatIfAnalyzeService) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un análisis AI de la sesión de What If' })
  @ApiResponse({ status: 201, type: WhatIfAnalyzeResDto })
  analyze(@Body() dto: WhatIfAnalyzeReqDto): Promise<WhatIfAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
