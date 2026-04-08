import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermission } from 'src/auth/decorators';
import {
  CreateIngresoAdjuntoDto,
  CreateIngresoDto,
  UpdateIngresoDto,
} from './dto/project-income.req.dto';
import {
  IngresoAdjuntoResponseDto,
  IngresoResponseDto,
  IngresoSummaryResponseDto,
} from './dto/project-income.res.dto';
import { ProjectIncomeService } from './project-income.service';

@ApiBearerAuth('access-token')
@ApiTags('project-income')
@Controller('project/:projectId/income')
export class ProjectIncomeController {
  constructor(private readonly service: ProjectIncomeService) {}

  // ─── LIST INGRESOS ────────────────────────────────────────────────────────
  @Get()
  @RequirePermission('project-budget:read')
  @ApiOperation({ summary: 'Lista los ingresos del proyecto' })
  findAll(@Param('projectId') projectId: string) {
    return this.service.findAll(+projectId);
  }

  // ─── GET SUMMARY ──────────────────────────────────────────────────────────
  @Get('summary')
  @RequirePermission('project-budget:read')
  @ApiOperation({ summary: 'Obtiene el resumen de ingresos del proyecto' })
  @ApiResponse({ status: 200, type: IngresoSummaryResponseDto })
  getSummary(@Param('projectId') projectId: string) {
    return this.service.getSummary(+projectId);
  }

  // ─── CREATE INGRESO ───────────────────────────────────────────────────────
  @Post()
  @RequirePermission('project-budget:update')
  @ApiOperation({ summary: 'Crea un ingreso del proyecto' })
  @ApiBody({ type: CreateIngresoDto })
  @ApiResponse({ status: 201, type: IngresoResponseDto })
  create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateIngresoDto,
  ) {
    return this.service.create(+projectId, dto);
  }

  // ─── UPDATE INGRESO ───────────────────────────────────────────────────────
  @Patch(':ingresoId')
  @RequirePermission('project-budget:update')
  @ApiOperation({ summary: 'Actualiza un ingreso del proyecto' })
  @ApiBody({ type: UpdateIngresoDto })
  @ApiResponse({ status: 200, type: IngresoResponseDto })
  update(
    @Param('projectId') projectId: string,
    @Param('ingresoId') ingresoId: string,
    @Body() dto: UpdateIngresoDto,
  ) {
    return this.service.update(+projectId, +ingresoId, dto);
  }

  // ─── DELETE INGRESO ───────────────────────────────────────────────────────
  @Delete(':ingresoId')
  @RequirePermission('project-budget:update')
  @ApiOperation({ summary: 'Elimina un ingreso del proyecto' })
  remove(
    @Param('projectId') projectId: string,
    @Param('ingresoId') ingresoId: string,
  ) {
    return this.service.remove(+projectId, +ingresoId);
  }

  // ─── CREATE ADJUNTO ───────────────────────────────────────────────────────
  @Post(':ingresoId/adjuntos')
  @RequirePermission('project-budget:update')
  @ApiOperation({ summary: 'Agrega un adjunto a un ingreso' })
  @ApiBody({ type: CreateIngresoAdjuntoDto })
  @ApiResponse({ status: 201, type: IngresoAdjuntoResponseDto })
  createAdjunto(
    @Param('projectId') projectId: string,
    @Param('ingresoId') ingresoId: string,
    @Body() dto: CreateIngresoAdjuntoDto,
  ) {
    return this.service.createAdjunto(+projectId, +ingresoId, dto);
  }

  // ─── DELETE ADJUNTO ───────────────────────────────────────────────────────
  @Delete(':ingresoId/adjuntos/:adjuntoId')
  @RequirePermission('project-budget:update')
  @ApiOperation({ summary: 'Elimina un adjunto de un ingreso' })
  deleteAdjunto(
    @Param('projectId') projectId: string,
    @Param('ingresoId') ingresoId: string,
    @Param('adjuntoId') adjuntoId: string,
  ) {
    return this.service.deleteAdjunto(+projectId, +ingresoId, +adjuntoId);
  }
}
