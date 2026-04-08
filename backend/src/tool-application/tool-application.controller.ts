import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
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
  CreateToolApplicationAttachmentRequestDto,
  CreateToolApplicationNoteRequestDto,
  CreateToolApplicationRequestDto,
  UpdateToolApplicationNoteRequestDto,
  UpdateToolApplicationRequestDto,
} from './dto/tool-application.req.dto';
import {
  ErrorResponseDto,
  GetAllToolApplicationsResponseDto,
  ToolApplicationResponseDto,
} from './dto/tool-application.res.dto';
import { ToolApplicationService } from './tool-application.service';

@ApiBearerAuth('access-token')
@ApiTags('tool-application')
@Controller('tool-application')
export class ToolApplicationController {
  constructor(private readonly service: ToolApplicationService) {}

  // ─── CREATE ───────────────────────────────────────────────────────────────
  @Post('create')
  @RequirePermission('tool-applications:create')
  @ApiOperation({
    summary: 'Crea una aplicación de herramienta en una fase de proyecto',
  })
  @ApiBody({ type: CreateToolApplicationRequestDto })
  @ApiResponse({ status: 201, type: ToolApplicationResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  create(@Body() dto: CreateToolApplicationRequestDto, @Request() req) {
    return this.service.create(dto, req.user.userId);
  }

  // ─── READ BY PROJECT PHASE ────────────────────────────────────────────────
  @Get('project-phase/:projectPhaseId')
  @RequirePermission('tool-applications:read')
  @ApiOperation({
    summary: 'Obtiene las aplicaciones de herramientas de una fase de proyecto',
  })
  @ApiResponse({ status: 200, type: GetAllToolApplicationsResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  findByProjectPhase(@Param('projectPhaseId') projectPhaseId: string) {
    return this.service.findByProjectPhase(+projectPhaseId);
  }

  // ─── READ ONE ─────────────────────────────────────────────────────────────
  @Get(':id')
  @RequirePermission('tool-applications:read')
  @ApiOperation({ summary: 'Obtiene una aplicación de herramienta por ID' })
  @ApiResponse({ status: 200, type: ToolApplicationResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  @Patch(':id')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Actualiza una aplicación de herramienta' })
  @ApiBody({ type: UpdateToolApplicationRequestDto })
  @ApiResponse({ status: 200, type: ToolApplicationResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateToolApplicationRequestDto,
  ) {
    return this.service.update(+id, dto);
  }

  // ─── ADD NOTE ─────────────────────────────────────────────────────────────
  @Post(':id/notes')
  @RequirePermission('tool-applications:create')
  @ApiOperation({ summary: 'Añade una nota a una aplicación de herramienta' })
  @ApiBody({ type: CreateToolApplicationNoteRequestDto })
  @ApiResponse({ status: 201, type: ToolApplicationResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  addNote(
    @Param('id') id: string,
    @Body() dto: CreateToolApplicationNoteRequestDto,
    @Request() req,
  ) {
    return this.service.addNote(+id, dto, req.user.userId);
  }

  // ─── UPDATE NOTE ──────────────────────────────────────────────────────────
  @Patch('notes/:noteId')
  @RequirePermission('tool-applications:update')
  @ApiOperation({ summary: 'Actualiza una nota' })
  @ApiBody({ type: UpdateToolApplicationNoteRequestDto })
  @ApiResponse({ status: 200, type: ToolApplicationResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  updateNote(
    @Param('noteId') noteId: string,
    @Body() dto: UpdateToolApplicationNoteRequestDto,
  ) {
    return this.service.updateNote(+noteId, dto);
  }

  // ─── DELETE NOTE ──────────────────────────────────────────────────────────
  @Delete('notes/:noteId')
  @RequirePermission('tool-applications:delete')
  @ApiOperation({ summary: 'Elimina una nota' })
  @ApiResponse({ status: 200, type: ToolApplicationResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  deleteNote(@Param('noteId') noteId: string) {
    return this.service.deleteNote(+noteId);
  }

  // ─── ADD ATTACHMENT ───────────────────────────────────────────────────────
  @Post(':id/attachments')
  @RequirePermission('tool-applications:create')
  @ApiOperation({ summary: 'Añade un adjunto a una aplicación de herramienta' })
  @ApiBody({ type: CreateToolApplicationAttachmentRequestDto })
  @ApiResponse({ status: 201, type: ToolApplicationResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  addAttachment(
    @Param('id') id: string,
    @Body() dto: CreateToolApplicationAttachmentRequestDto,
    @Request() req,
  ) {
    return this.service.addAttachment(+id, dto, req.user.userId);
  }

  // ─── DELETE ATTACHMENT ────────────────────────────────────────────────────
  @Delete('attachments/:attachmentId')
  @RequirePermission('tool-applications:delete')
  @ApiOperation({ summary: 'Elimina un adjunto' })
  @ApiResponse({ status: 200, type: ToolApplicationResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  deleteAttachment(@Param('attachmentId') attachmentId: string) {
    return this.service.deleteAttachment(+attachmentId);
  }
}
