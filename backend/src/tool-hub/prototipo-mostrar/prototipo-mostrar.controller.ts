import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { PrototipoMostrarAnalyzeService } from './prototipo-mostrar-analyze.service';
import { PrototipoMostrarAnalyzeReqDto } from './dto/prototipo-mostrar-analyze.req.dto';
import { PrototipoMostrarAnalyzeResDto } from './dto/prototipo-mostrar-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / prototipo-mostrar')
@Controller('tool-hub/prototipo-mostrar')
export class PrototipoMostrarController {
  constructor(
    private readonly analyzeService: PrototipoMostrarAnalyzeService,
  ) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un análisis AI del Prototipo para Mostrar' })
  @ApiResponse({ status: 201, type: PrototipoMostrarAnalyzeResDto })
  analyze(
    @Body() dto: PrototipoMostrarAnalyzeReqDto,
  ): Promise<PrototipoMostrarAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
