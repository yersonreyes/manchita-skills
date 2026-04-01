import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { FocusGroupAnalyzeService } from './focus-group-analyze.service';
import { FocusGroupAnalyzeReqDto } from './dto/focus-group-analyze.req.dto';
import { FocusGroupAnalyzeResDto } from './dto/focus-group-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / focus-group')
@Controller('tool-hub/focus-group')
export class FocusGroupController {
  constructor(private readonly analyzeService: FocusGroupAnalyzeService) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un análisis AI de Focus Group' })
  @ApiResponse({ status: 201, type: FocusGroupAnalyzeResDto })
  analyze(@Body() dto: FocusGroupAnalyzeReqDto): Promise<FocusGroupAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
