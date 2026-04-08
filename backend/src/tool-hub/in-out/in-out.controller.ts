import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { InOutAnalyzeService } from './in-out-analyze.service';
import { InOutAnalyzeReqDto } from './dto/in-out-analyze.req.dto';
import { InOutAnalyzeResDto } from './dto/in-out-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / in-out')
@Controller('tool-hub/in-out')
export class InOutController {
  constructor(private readonly analyzeService: InOutAnalyzeService) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un informe AI del Diagrama de In/Out' })
  @ApiResponse({ status: 201, type: InOutAnalyzeResDto })
  analyze(@Body() dto: InOutAnalyzeReqDto): Promise<InOutAnalyzeResDto> {
    return this.analyzeService.execute(dto, dto.currentVersion);
  }
}
