import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermission } from '../auth/decorators';
import { CreateWikiPageDto } from './dto/create-wiki-page.dto';
import { UpdateWikiPageDto } from './dto/update-wiki-page.dto';
import { WikiPageResDto } from './dto/wiki-page.res.dto';
import { WikiService } from './wiki.service';

@ApiBearerAuth('access-token')
@ApiTags('wiki')
@Controller('wiki')
export class WikiController {
  constructor(private readonly wikiService: WikiService) {}

  @Get('project/:projectId')
  @RequirePermission('wiki:read')
  @ApiOperation({ summary: 'Obtener árbol de wiki del proyecto (lista flat)' })
  @ApiResponse({ status: 200, type: [WikiPageResDto] })
  getByProject(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.wikiService.getByProject(projectId);
  }

  @Get(':id')
  @RequirePermission('wiki:read')
  @ApiOperation({ summary: 'Obtener una página de wiki' })
  @ApiResponse({ status: 200, type: WikiPageResDto })
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.wikiService.getById(id);
  }

  @Post()
  @RequirePermission('wiki:write')
  @ApiOperation({ summary: 'Crear una página de wiki' })
  @ApiResponse({ status: 201, type: WikiPageResDto })
  create(@Body() dto: CreateWikiPageDto, @Request() req) {
    return this.wikiService.create(dto, req.user.userId);
  }

  @Patch(':id')
  @RequirePermission('wiki:write')
  @ApiOperation({ summary: 'Editar una página de wiki' })
  @ApiResponse({ status: 200, type: WikiPageResDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateWikiPageDto) {
    return this.wikiService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermission('wiki:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar (soft delete) una página de wiki' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.wikiService.remove(id);
  }
}
