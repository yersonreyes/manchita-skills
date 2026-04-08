import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { MetaforaProblemaAnalyzeService } from './metafora-problema-analyze.service';
import { MetaforaProblemaAnalyzeReqDto } from './dto/metafora-problema-analyze.req.dto';
import { MetaforaProblemaAnalyzeResDto } from './dto/metafora-problema-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / metafora-problema')
@Controller('tool-hub/metafora-problema')
export class MetaforaProblemaController {
  constructor(
    private readonly analyzeService: MetaforaProblemaAnalyzeService,
  ) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({
    summary: 'Genera un análisis AI de las metáforas del problema',
  })
  @ApiResponse({ status: 201, type: MetaforaProblemaAnalyzeResDto })
  analyze(
    @Body() dto: MetaforaProblemaAnalyzeReqDto,
  ): Promise<MetaforaProblemaAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
