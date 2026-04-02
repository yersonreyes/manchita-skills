import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { DesafioDisenoAnalyzeService } from './desafio-diseno-analyze.service';
import { DesafioDisenoAnalyzeReqDto } from './dto/desafio-diseno-analyze.req.dto';
import { DesafioDisenoAnalyzeResDto } from './dto/desafio-diseno-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / desafio-diseno')
@Controller('tool-hub/desafio-diseno')
export class DesafioDisenoController {
  constructor(private readonly analyzeService: DesafioDisenoAnalyzeService) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un análisis AI del Desafío de Diseño' })
  @ApiResponse({ status: 201, type: DesafioDisenoAnalyzeResDto })
  analyze(@Body() dto: DesafioDisenoAnalyzeReqDto): Promise<DesafioDisenoAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
