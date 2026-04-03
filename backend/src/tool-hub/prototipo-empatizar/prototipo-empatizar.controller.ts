import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { PrototipoEmpatizarAnalyzeService } from './prototipo-empatizar-analyze.service';
import { PrototipoEmpatizarAnalyzeReqDto } from './dto/prototipo-empatizar-analyze.req.dto';
import { PrototipoEmpatizarAnalyzeResDto } from './dto/prototipo-empatizar-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / prototipo-empatizar')
@Controller('tool-hub/prototipo-empatizar')
export class PrototipoEmpatizarController {
  constructor(private readonly analyzeService: PrototipoEmpatizarAnalyzeService) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un análisis AI del Prototipo para Empatizar' })
  @ApiResponse({ status: 201, type: PrototipoEmpatizarAnalyzeResDto })
  analyze(@Body() dto: PrototipoEmpatizarAnalyzeReqDto): Promise<PrototipoEmpatizarAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
