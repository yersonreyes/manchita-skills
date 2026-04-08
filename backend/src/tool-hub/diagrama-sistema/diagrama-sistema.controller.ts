import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { DiagramaSistemaAnalyzeService } from './diagrama-sistema-analyze.service';
import { DiagramaSistemaAnalyzeReqDto } from './dto/diagrama-sistema-analyze.req.dto';
import { DiagramaSistemaAnalyzeResDto } from './dto/diagrama-sistema-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / diagrama-sistema')
@Controller('tool-hub/diagrama-sistema')
export class DiagramaSistemaController {
  constructor(private readonly analyzeService: DiagramaSistemaAnalyzeService) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un informe AI del Diagrama de Sistema' })
  @ApiResponse({ status: 201, type: DiagramaSistemaAnalyzeResDto })
  analyze(
    @Body() dto: DiagramaSistemaAnalyzeReqDto,
  ): Promise<DiagramaSistemaAnalyzeResDto> {
    return this.analyzeService.execute(dto, dto.currentVersion);
  }
}
