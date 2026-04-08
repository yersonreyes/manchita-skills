import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { SeleccionIdeasAnalyzeService } from './seleccion-ideas-analyze.service';
import { SeleccionIdeasAnalyzeReqDto } from './dto/seleccion-ideas-analyze.req.dto';
import { SeleccionIdeasAnalyzeResDto } from './dto/seleccion-ideas-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / seleccion-ideas')
@Controller('tool-hub/seleccion-ideas')
export class SeleccionIdeasController {
  constructor(private readonly analyzeService: SeleccionIdeasAnalyzeService) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({
    summary: 'Genera un análisis AI del proceso de Selección de Ideas',
  })
  @ApiResponse({ status: 201, type: SeleccionIdeasAnalyzeResDto })
  analyze(
    @Body() dto: SeleccionIdeasAnalyzeReqDto,
  ): Promise<SeleccionIdeasAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
