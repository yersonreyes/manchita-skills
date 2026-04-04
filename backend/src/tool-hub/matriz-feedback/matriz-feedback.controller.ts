import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { MatrizFeedbackAnalyzeService } from './matriz-feedback-analyze.service';
import { MatrizFeedbackAnalyzeReqDto } from './dto/matriz-feedback-analyze.req.dto';
import { MatrizFeedbackAnalyzeResDto } from './dto/matriz-feedback-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / matriz-feedback')
@Controller('tool-hub/matriz-feedback')
export class MatrizFeedbackController {
  constructor(private readonly analyzeService: MatrizFeedbackAnalyzeService) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un análisis AI de la Matriz de Feedback' })
  @ApiResponse({ status: 201, type: MatrizFeedbackAnalyzeResDto })
  analyze(@Body() dto: MatrizFeedbackAnalyzeReqDto): Promise<MatrizFeedbackAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
