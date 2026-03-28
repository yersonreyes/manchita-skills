import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermission } from 'src/auth/decorators';
import {
  CreateDesignPhaseRequestDto,
  UpdateDesignPhaseRequestDto,
} from './dto/design-phase.req.dto';
import {
  DesignPhaseResponseDto,
  ErrorResponseDto,
  GetAllDesignPhasesResponseDto,
} from './dto/design-phase.res.dto';
import { DesignPhaseService } from './design-phase.service';

@ApiBearerAuth('access-token')
@ApiTags('design-phase')
@Controller('design-phase')
export class DesignPhaseController {
  constructor(private readonly service: DesignPhaseService) {}

  // ─── CREATE ───────────────────────────────────────────────────────────────
  @Post('create')
  @RequirePermission('design-phases:create')
  @ApiOperation({ summary: 'Crea una nueva fase de diseño' })
  @ApiBody({ type: CreateDesignPhaseRequestDto })
  @ApiResponse({ status: 201, type: DesignPhaseResponseDto })
  @ApiResponse({ status: 409, type: ErrorResponseDto })
  create(@Body() dto: CreateDesignPhaseRequestDto) {
    return this.service.create(dto);
  }

  // ─── READ ALL ─────────────────────────────────────────────────────────────
  @Get('all')
  @RequirePermission('design-phases:read')
  @ApiOperation({ summary: 'Obtiene todas las fases de diseño' })
  @ApiResponse({ status: 200, type: GetAllDesignPhasesResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  findAll() {
    return this.service.findAll();
  }

  // ─── READ ONE ─────────────────────────────────────────────────────────────
  @Get(':id')
  @RequirePermission('design-phases:read')
  @ApiOperation({ summary: 'Obtiene una fase de diseño por ID' })
  @ApiResponse({ status: 200, type: DesignPhaseResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  @Patch(':id')
  @RequirePermission('design-phases:update')
  @ApiOperation({ summary: 'Actualiza una fase de diseño' })
  @ApiBody({ type: UpdateDesignPhaseRequestDto })
  @ApiResponse({ status: 200, type: DesignPhaseResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  @ApiResponse({ status: 409, type: ErrorResponseDto })
  update(@Param('id') id: string, @Body() dto: UpdateDesignPhaseRequestDto) {
    return this.service.update(+id, dto);
  }
}
