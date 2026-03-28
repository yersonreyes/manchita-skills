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
  AssignToolCategoriesRequestDto,
  CreateToolRequestDto,
  UpdateToolRequestDto,
} from './dto/tool.req.dto';
import {
  ErrorResponseDto,
  GetAllToolsResponseDto,
  ToolResponseDto,
} from './dto/tool.res.dto';
import { ToolService } from './tool.service';

@ApiBearerAuth('access-token')
@ApiTags('tool')
@Controller('tool')
export class ToolController {
  constructor(private readonly service: ToolService) {}

  // ─── CREATE ───────────────────────────────────────────────────────────────
  @Post('create')
  @RequirePermission('tools:create')
  @ApiOperation({ summary: 'Crea una nueva herramienta de diseño' })
  @ApiBody({ type: CreateToolRequestDto })
  @ApiResponse({ status: 201, type: ToolResponseDto })
  @ApiResponse({ status: 409, type: ErrorResponseDto })
  create(@Body() dto: CreateToolRequestDto) {
    return this.service.create(dto);
  }

  // ─── READ ALL ─────────────────────────────────────────────────────────────
  @Get('all')
  @RequirePermission('tools:read')
  @ApiOperation({ summary: 'Obtiene todas las herramientas' })
  @ApiResponse({ status: 200, type: GetAllToolsResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  findAll() {
    return this.service.findAll();
  }

  // ─── READ ONE ─────────────────────────────────────────────────────────────
  @Get(':id')
  @RequirePermission('tools:read')
  @ApiOperation({ summary: 'Obtiene una herramienta por ID' })
  @ApiResponse({ status: 200, type: ToolResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  @Patch(':id')
  @RequirePermission('tools:update')
  @ApiOperation({ summary: 'Actualiza una herramienta' })
  @ApiBody({ type: UpdateToolRequestDto })
  @ApiResponse({ status: 200, type: ToolResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  @ApiResponse({ status: 409, type: ErrorResponseDto })
  update(@Param('id') id: string, @Body() dto: UpdateToolRequestDto) {
    return this.service.update(+id, dto);
  }

  // ─── ASSIGN CATEGORIES ────────────────────────────────────────────────────
  @Patch(':id/categories')
  @RequirePermission('tools:update')
  @ApiOperation({ summary: 'Asigna categorías a una herramienta' })
  @ApiBody({ type: AssignToolCategoriesRequestDto })
  @ApiResponse({ status: 200, type: ToolResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  assignCategories(
    @Param('id') id: string,
    @Body() dto: AssignToolCategoriesRequestDto,
  ) {
    return this.service.assignCategories(+id, dto);
  }
}
