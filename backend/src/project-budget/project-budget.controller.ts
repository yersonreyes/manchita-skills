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
  CreateAdjuntoDto,
  CreateRecursoDto,
  UpdateBudgetDto,
  UpdateRecursoDto,
} from './dto/project-budget.req.dto';
import {
  AdjuntoResponseDto,
  BudgetSummaryResponseDto,
  DesgloseMensualResponseDto,
  RecursoResponseDto,
} from './dto/project-budget.res.dto';
import { ProjectBudgetService } from './project-budget.service';

@ApiBearerAuth('access-token')
@ApiTags('project-budget')
@Controller('project/:projectId/budget')
export class ProjectBudgetController {
  constructor(private readonly service: ProjectBudgetService) {}

  // ─── GET SUMMARY ──────────────────────────────────────────────────────────
  @Get('summary')
  @RequirePermission('project-budget:read')
  @ApiOperation({ summary: 'Obtiene el resumen del presupuesto del proyecto' })
  @ApiResponse({ status: 200, type: BudgetSummaryResponseDto })
  getSummary(@Param('projectId') projectId: string) {
    return this.service.getSummary(+projectId);
  }

  // ─── GET DESGLOSE MENSUAL ─────────────────────────────────────────────────
  @Get('desglose-mensual')
  @RequirePermission('project-budget:read')
  @ApiOperation({ summary: 'Obtiene el desglose mensual del presupuesto' })
  @ApiResponse({ status: 200, type: DesgloseMensualResponseDto })
  getDesgloseMensual(@Param('projectId') projectId: string) {
    return this.service.getDesgloseMensual(+projectId);
  }

  // ─── UPDATE BUDGET ────────────────────────────────────────────────────────
  @Patch()
  @RequirePermission('project-budget:update')
  @ApiOperation({ summary: 'Actualiza presupuesto y moneda del proyecto' })
  @ApiBody({ type: UpdateBudgetDto })
  @ApiResponse({ status: 200, type: BudgetSummaryResponseDto })
  updateBudget(
    @Param('projectId') projectId: string,
    @Body() dto: UpdateBudgetDto,
  ) {
    return this.service.updateBudget(+projectId, dto);
  }

  // ─── CREATE RECURSO ───────────────────────────────────────────────────────
  @Post('recursos')
  @RequirePermission('project-budget:update')
  @ApiOperation({ summary: 'Crea un recurso del presupuesto' })
  @ApiBody({ type: CreateRecursoDto })
  @ApiResponse({ status: 201, type: RecursoResponseDto })
  createRecurso(
    @Param('projectId') projectId: string,
    @Body() dto: CreateRecursoDto,
  ) {
    return this.service.createRecurso(+projectId, dto);
  }

  // ─── UPDATE RECURSO ───────────────────────────────────────────────────────
  @Patch('recursos/:recursoId')
  @RequirePermission('project-budget:update')
  @ApiOperation({ summary: 'Actualiza un recurso del presupuesto' })
  @ApiBody({ type: UpdateRecursoDto })
  @ApiResponse({ status: 200, type: RecursoResponseDto })
  updateRecurso(
    @Param('projectId') projectId: string,
    @Param('recursoId') recursoId: string,
    @Body() dto: UpdateRecursoDto,
  ) {
    return this.service.updateRecurso(+projectId, +recursoId, dto);
  }

  // ─── DELETE RECURSO ───────────────────────────────────────────────────────
  @Delete('recursos/:recursoId')
  @RequirePermission('project-budget:update')
  @ApiOperation({ summary: 'Elimina un recurso del presupuesto' })
  deleteRecurso(
    @Param('projectId') projectId: string,
    @Param('recursoId') recursoId: string,
  ) {
    return this.service.deleteRecurso(+projectId, +recursoId);
  }

  // ─── CREATE ADJUNTO ───────────────────────────────────────────────────────
  @Post('recursos/:recursoId/adjuntos')
  @RequirePermission('project-budget:update')
  @ApiOperation({ summary: 'Agrega un adjunto a un recurso' })
  @ApiBody({ type: CreateAdjuntoDto })
  @ApiResponse({ status: 201, type: AdjuntoResponseDto })
  createAdjunto(
    @Param('projectId') projectId: string,
    @Param('recursoId') recursoId: string,
    @Body() dto: CreateAdjuntoDto,
  ) {
    return this.service.createAdjunto(+projectId, +recursoId, dto);
  }

  // ─── DELETE ADJUNTO ───────────────────────────────────────────────────────
  @Delete('recursos/:recursoId/adjuntos/:adjuntoId')
  @RequirePermission('project-budget:update')
  @ApiOperation({ summary: 'Elimina un adjunto de un recurso' })
  deleteAdjunto(
    @Param('projectId') projectId: string,
    @Param('recursoId') recursoId: string,
    @Param('adjuntoId') adjuntoId: string,
  ) {
    return this.service.deleteAdjunto(+projectId, +recursoId, +adjuntoId);
  }
}
