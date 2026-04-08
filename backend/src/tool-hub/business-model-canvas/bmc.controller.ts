import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { BmcAnalyzeService } from './bmc-analyze.service';
import { BmcAnalyzeReqDto } from './dto/bmc.req.dto';
import { BmcAnalyzeResDto } from './dto/bmc.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / business-model-canvas')
@Controller('tool-hub/bmc')
export class BmcController {
  constructor(private readonly analyzeService: BmcAnalyzeService) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un informe AI del Business Model Canvas' })
  @ApiResponse({ status: 201, type: BmcAnalyzeResDto })
  analyze(@Body() dto: BmcAnalyzeReqDto): Promise<BmcAnalyzeResDto> {
    return this.analyzeService.execute(dto, dto.currentVersion);
  }
}
