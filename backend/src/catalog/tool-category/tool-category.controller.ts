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
  CreateToolCategoryRequestDto,
  UpdateToolCategoryRequestDto,
} from './dto/tool-category.req.dto';
import {
  ErrorResponseDto,
  GetAllToolCategoriesResponseDto,
  ToolCategoryResponseDto,
} from './dto/tool-category.res.dto';
import { ToolCategoryService } from './tool-category.service';

@ApiBearerAuth('access-token')
@ApiTags('tool-category')
@Controller('tool-category')
export class ToolCategoryController {
  constructor(private readonly service: ToolCategoryService) {}

  // ─── CREATE ───────────────────────────────────────────────────────────────
  @Post('create')
  @RequirePermission('tool-categories:create')
  @ApiOperation({ summary: 'Crea una nueva categoría de herramienta' })
  @ApiBody({ type: CreateToolCategoryRequestDto })
  @ApiResponse({ status: 201, type: ToolCategoryResponseDto })
  @ApiResponse({ status: 409, type: ErrorResponseDto })
  create(@Body() dto: CreateToolCategoryRequestDto) {
    return this.service.create(dto);
  }

  // ─── READ ALL ─────────────────────────────────────────────────────────────
  @Get('all')
  @RequirePermission('tool-categories:read')
  @ApiOperation({ summary: 'Obtiene todas las categorías' })
  @ApiResponse({ status: 200, type: GetAllToolCategoriesResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  findAll() {
    return this.service.findAll();
  }

  // ─── READ BY PHASE ────────────────────────────────────────────────────────
  @Get('phase/:phaseId')
  @RequirePermission('tool-categories:read')
  @ApiOperation({ summary: 'Obtiene categorías por fase de diseño' })
  @ApiResponse({ status: 200, type: GetAllToolCategoriesResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  findByPhase(@Param('phaseId') phaseId: string) {
    return this.service.findByPhase(+phaseId);
  }

  // ─── READ ONE ─────────────────────────────────────────────────────────────
  @Get(':id')
  @RequirePermission('tool-categories:read')
  @ApiOperation({ summary: 'Obtiene una categoría por ID' })
  @ApiResponse({ status: 200, type: ToolCategoryResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  @Patch(':id')
  @RequirePermission('tool-categories:update')
  @ApiOperation({ summary: 'Actualiza una categoría' })
  @ApiBody({ type: UpdateToolCategoryRequestDto })
  @ApiResponse({ status: 200, type: ToolCategoryResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  @ApiResponse({ status: 409, type: ErrorResponseDto })
  update(@Param('id') id: string, @Body() dto: UpdateToolCategoryRequestDto) {
    return this.service.update(+id, dto);
  }
}
