import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { TestUsuarioAnalyzeService } from './test-usuario-analyze.service';
import { TestUsuarioAnalyzeReqDto } from './dto/test-usuario-analyze.req.dto';
import { TestUsuarioAnalyzeResDto } from './dto/test-usuario-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / test-usuario')
@Controller('tool-hub/test-usuario')
export class TestUsuarioController {
  constructor(private readonly analyzeService: TestUsuarioAnalyzeService) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un análisis AI del Test de Usuario' })
  @ApiResponse({ status: 201, type: TestUsuarioAnalyzeResDto })
  analyze(
    @Body() dto: TestUsuarioAnalyzeReqDto,
  ): Promise<TestUsuarioAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
