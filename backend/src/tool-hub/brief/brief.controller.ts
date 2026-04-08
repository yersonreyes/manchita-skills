import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { BriefAnalyzeService } from './brief-analyze.service';
import { BriefAnalyzeReqDto } from './dto/brief-analyze.req.dto';
import { BriefAnalyzeResDto } from './dto/brief-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / brief')
@Controller('tool-hub/brief')
export class BriefController {
  constructor(private readonly analyzeService: BriefAnalyzeService) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera una auditoría AI del Brief de Proyecto' })
  @ApiResponse({ status: 201, type: BriefAnalyzeResDto })
  analyze(@Body() dto: BriefAnalyzeReqDto): Promise<BriefAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
