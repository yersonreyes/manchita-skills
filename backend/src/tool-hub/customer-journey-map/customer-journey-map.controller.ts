import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermission } from '../../auth/decorators';
import { CustomerJourneyMapAnalyzeService } from './customer-journey-map-analyze.service';
import { CustomerJourneyMapAnalyzeReqDto } from './dto/customer-journey-map-analyze.req.dto';
import { CustomerJourneyMapAnalyzeResDto } from './dto/customer-journey-map-analyze.res.dto';

@ApiBearerAuth('access-token')
@ApiTags('tool-hub / customer-journey-map')
@Controller('tool-hub/customer-journey-map')
export class CustomerJourneyMapController {
  constructor(private readonly analyzeService: CustomerJourneyMapAnalyzeService) {}

  @Post('analyze')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Genera un informe AI del Customer Journey Map' })
  @ApiResponse({ status: 201, type: CustomerJourneyMapAnalyzeResDto })
  analyze(@Body() dto: CustomerJourneyMapAnalyzeReqDto): Promise<CustomerJourneyMapAnalyzeResDto> {
    return this.analyzeService.execute(dto);
  }
}
