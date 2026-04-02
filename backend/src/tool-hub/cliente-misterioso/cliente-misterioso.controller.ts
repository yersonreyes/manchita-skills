import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { ClienteMisteriosoAnalyzeService } from './cliente-misterioso-analyze.service';
import { ClienteMisteriosoAnalyzeReqDto } from './dto/cliente-misterioso-analyze.req.dto';
import { ClienteMisteriosoAnalyzeResDto } from './dto/cliente-misterioso-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / cliente-misterioso')
@Controller('tool-hub/cliente-misterioso')
export class ClienteMisteriosoController {
  constructor(private readonly analyzeService: ClienteMisteriosoAnalyzeService) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un análisis AI de Cliente Misterioso' })
  @ApiResponse({ status: 201, type: ClienteMisteriosoAnalyzeResDto })
  analyze(@Body() dto: ClienteMisteriosoAnalyzeReqDto): Promise<ClienteMisteriosoAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
