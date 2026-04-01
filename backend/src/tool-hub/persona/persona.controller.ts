import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { PersonaAnalyzeService } from './persona-analyze.service';
import { PersonaAnalyzeReqDto } from './dto/persona-analyze.req.dto';
import { PersonaAnalyzeResDto } from './dto/persona-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / persona')
@Controller('tool-hub/persona')
export class PersonaController {
  constructor(private readonly analyzeService: PersonaAnalyzeService) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un informe AI de User Persona' })
  @ApiResponse({ status: 201, type: PersonaAnalyzeResDto })
  analyze(@Body() dto: PersonaAnalyzeReqDto): Promise<PersonaAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
