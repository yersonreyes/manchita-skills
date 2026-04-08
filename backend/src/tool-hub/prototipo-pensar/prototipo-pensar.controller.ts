import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { PrototipoPensarAnalyzeService } from './prototipo-pensar-analyze.service';
import { PrototipoPensarAnalyzeReqDto } from './dto/prototipo-pensar-analyze.req.dto';
import { PrototipoPensarAnalyzeResDto } from './dto/prototipo-pensar-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / prototipo-pensar')
@Controller('tool-hub/prototipo-pensar')
export class PrototipoPensarController {
  constructor(private readonly analyzeService: PrototipoPensarAnalyzeService) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un análisis AI del Prototipo para Pensar' })
  @ApiResponse({ status: 201, type: PrototipoPensarAnalyzeResDto })
  analyze(
    @Body() dto: PrototipoPensarAnalyzeReqDto,
  ): Promise<PrototipoPensarAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
