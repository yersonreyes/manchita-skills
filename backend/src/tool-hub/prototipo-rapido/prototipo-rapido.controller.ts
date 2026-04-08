import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { PrototipoRapidoAnalyzeService } from './prototipo-rapido-analyze.service';
import { PrototipoRapidoAnalyzeReqDto } from './dto/prototipo-rapido-analyze.req.dto';
import { PrototipoRapidoAnalyzeResDto } from './dto/prototipo-rapido-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / prototipo-rapido')
@Controller('tool-hub/prototipo-rapido')
export class PrototipoRapidoController {
  constructor(private readonly analyzeService: PrototipoRapidoAnalyzeService) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un análisis AI del Prototipo Rápido' })
  @ApiResponse({ status: 201, type: PrototipoRapidoAnalyzeResDto })
  analyze(
    @Body() dto: PrototipoRapidoAnalyzeReqDto,
  ): Promise<PrototipoRapidoAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
