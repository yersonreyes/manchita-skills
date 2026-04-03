import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { PrototipoFisicoAnalyzeService } from './prototipo-fisico-analyze.service';
import { PrototipoFisicoAnalyzeReqDto } from './dto/prototipo-fisico-analyze.req.dto';
import { PrototipoFisicoAnalyzeResDto } from './dto/prototipo-fisico-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / prototipo-fisico')
@Controller('tool-hub/prototipo-fisico')
export class PrototipoFisicoController {
  constructor(private readonly analyzeService: PrototipoFisicoAnalyzeService) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un análisis AI del Prototipo Físico' })
  @ApiResponse({ status: 201, type: PrototipoFisicoAnalyzeResDto })
  analyze(@Body() dto: PrototipoFisicoAnalyzeReqDto): Promise<PrototipoFisicoAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
