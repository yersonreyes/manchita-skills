import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { ShadowingAnalyzeService } from './shadowing-analyze.service';
import { ShadowingAnalyzeReqDto } from './dto/shadowing-analyze.req.dto';
import { ShadowingAnalyzeResDto } from './dto/shadowing-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / shadowing')
@Controller('tool-hub/shadowing')
export class ShadowingController {
  constructor(private readonly analyzeService: ShadowingAnalyzeService) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un análisis AI de Shadowing' })
  @ApiResponse({ status: 201, type: ShadowingAnalyzeResDto })
  analyze(
    @Body() dto: ShadowingAnalyzeReqDto,
  ): Promise<ShadowingAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
