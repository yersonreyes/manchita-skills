import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { MvpAnalyzeService } from './mvp-analyze.service';
import { MvpAnalyzeReqDto } from './dto/mvp-analyze.req.dto';
import { MvpAnalyzeResDto } from './dto/mvp-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / mvp')
@Controller('tool-hub/mvp')
export class MvpController {
  constructor(private readonly analyzeService: MvpAnalyzeService) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un análisis AI del MVP' })
  @ApiResponse({ status: 201, type: MvpAnalyzeResDto })
  analyze(@Body() dto: MvpAnalyzeReqDto): Promise<MvpAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
