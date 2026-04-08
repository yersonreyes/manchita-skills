import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { SafariAnalyzeService } from './safari-analyze.service';
import { SafariAnalyzeReqDto } from './dto/safari-analyze.req.dto';
import { SafariAnalyzeResDto } from './dto/safari-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / safari')
@Controller('tool-hub/safari')
export class SafariController {
  constructor(private readonly analyzeService: SafariAnalyzeService) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un análisis AI de Safari / Design Safari' })
  @ApiResponse({ status: 201, type: SafariAnalyzeResDto })
  analyze(@Body() dto: SafariAnalyzeReqDto): Promise<SafariAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
