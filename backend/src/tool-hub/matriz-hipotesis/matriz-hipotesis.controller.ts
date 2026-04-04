import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { MatrizHipotesisAnalyzeService } from './matriz-hipotesis-analyze.service';
import { MatrizHipotesisAnalyzeReqDto } from './dto/matriz-hipotesis-analyze.req.dto';
import { MatrizHipotesisAnalyzeResDto } from './dto/matriz-hipotesis-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / matriz-hipotesis')
@Controller('tool-hub/matriz-hipotesis')
export class MatrizHipotesisController {
  constructor(private readonly analyzeService: MatrizHipotesisAnalyzeService) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un análisis AI de la Matriz de Hipótesis' })
  @ApiResponse({ status: 201, type: MatrizHipotesisAnalyzeResDto })
  analyze(@Body() dto: MatrizHipotesisAnalyzeReqDto): Promise<MatrizHipotesisAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
