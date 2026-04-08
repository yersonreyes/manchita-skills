import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { FromToAnalyzeService } from './from-to-analyze.service';
import { FromToAnalyzeReqDto } from './dto/from-to-analyze.req.dto';
import { FromToAnalyzeResDto } from './dto/from-to-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / from-to')
@Controller('tool-hub/from-to')
export class FromToController {
  constructor(private readonly analyzeService: FromToAnalyzeService) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un análisis AI del From-To' })
  @ApiResponse({ status: 201, type: FromToAnalyzeResDto })
  analyze(@Body() dto: FromToAnalyzeReqDto): Promise<FromToAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
