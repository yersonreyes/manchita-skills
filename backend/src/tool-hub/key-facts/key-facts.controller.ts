import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { KeyFactsAnalyzeService } from './key-facts-analyze.service';
import { KeyFactsAnalyzeReqDto } from './dto/key-facts-analyze.req.dto';
import { KeyFactsAnalyzeResDto } from './dto/key-facts-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / key-facts')
@Controller('tool-hub/key-facts')
export class KeyFactsController {
  constructor(private readonly analyzeService: KeyFactsAnalyzeService) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un análisis AI de Key Facts' })
  @ApiResponse({ status: 201, type: KeyFactsAnalyzeResDto })
  analyze(@Body() dto: KeyFactsAnalyzeReqDto): Promise<KeyFactsAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
