import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { TestCuantitativoAnalyzeService } from './test-cuantitativo-analyze.service';
import { TestCuantitativoAnalyzeReqDto } from './dto/test-cuantitativo-analyze.req.dto';
import { TestCuantitativoAnalyzeResDto } from './dto/test-cuantitativo-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / test-cuantitativo')
@Controller('tool-hub/test-cuantitativo')
export class TestCuantitativoController {
  constructor(private readonly analyzeService: TestCuantitativoAnalyzeService) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un análisis AI del Test Cuantitativo' })
  @ApiResponse({ status: 201, type: TestCuantitativoAnalyzeResDto })
  analyze(@Body() dto: TestCuantitativoAnalyzeReqDto): Promise<TestCuantitativoAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
