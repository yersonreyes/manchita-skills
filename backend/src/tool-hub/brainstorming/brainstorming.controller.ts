import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { BrainstormingAnalyzeService } from './brainstorming-analyze.service';
import { BrainstormingAnalyzeReqDto } from './dto/brainstorming-analyze.req.dto';
import { BrainstormingAnalyzeResDto } from './dto/brainstorming-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / brainstorming')
@Controller('tool-hub/brainstorming')
export class BrainstormingController {
  constructor(private readonly analyzeService: BrainstormingAnalyzeService) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({
    summary: 'Genera un análisis AI de la sesión de Brainstorming',
  })
  @ApiResponse({ status: 201, type: BrainstormingAnalyzeResDto })
  analyze(
    @Body() dto: BrainstormingAnalyzeReqDto,
  ): Promise<BrainstormingAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
