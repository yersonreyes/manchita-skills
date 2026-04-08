import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { PrototipoFuncionalAnalyzeService } from './prototipo-funcional-analyze.service';
import { PrototipoFuncionalAnalyzeReqDto } from './dto/prototipo-funcional-analyze.req.dto';
import { PrototipoFuncionalAnalyzeResDto } from './dto/prototipo-funcional-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / prototipo-funcional')
@Controller('tool-hub/prototipo-funcional')
export class PrototipoFuncionalController {
  constructor(
    private readonly analyzeService: PrototipoFuncionalAnalyzeService,
  ) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un análisis AI del Prototipo Funcional' })
  @ApiResponse({ status: 201, type: PrototipoFuncionalAnalyzeResDto })
  analyze(
    @Body() dto: PrototipoFuncionalAnalyzeReqDto,
  ): Promise<PrototipoFuncionalAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
