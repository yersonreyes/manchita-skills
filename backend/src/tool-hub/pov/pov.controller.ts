import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { PovAnalyzeService } from './pov-analyze.service';
import { PovAnalyzeReqDto } from './dto/pov-analyze.req.dto';
import { PovAnalyzeResDto } from './dto/pov-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / pov')
@Controller('tool-hub/pov')
export class PovController {
  constructor(private readonly analyzeService: PovAnalyzeService) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({
    summary: 'Genera un análisis AI del POV con derivación de HMW',
  })
  @ApiResponse({ status: 201, type: PovAnalyzeResDto })
  analyze(@Body() dto: PovAnalyzeReqDto): Promise<PovAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
