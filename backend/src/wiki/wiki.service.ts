import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWikiPageDto } from './dto/create-wiki-page.dto';
import { UpdateWikiPageDto } from './dto/update-wiki-page.dto';

@Injectable()
export class WikiService {
  constructor(private readonly prisma: PrismaService) {}

  getByProject(projectId: number) {
    return this.prisma.wikiPage.findMany({
      where: { projectId, activo: true },
      orderBy: [{ parentId: 'asc' }, { orden: 'asc' }],
    });
  }

  async getById(id: number) {
    const page = await this.prisma.wikiPage.findFirst({
      where: { id, activo: true },
    });
    if (!page) throw new NotFoundException(`WikiPage #${id} no encontrada`);
    return page;
  }

  create(dto: CreateWikiPageDto, createdById: number) {
    return this.prisma.wikiPage.create({
      data: {
        projectId: dto.projectId,
        parentId: dto.parentId ?? null,
        titulo: dto.titulo,
        contenido: dto.contenido ?? '',
        orden: dto.orden ?? 0,
        createdById,
      },
    });
  }

  async update(id: number, dto: UpdateWikiPageDto) {
    await this.getById(id);
    return this.prisma.wikiPage.update({
      where: { id },
      data: {
        ...(dto.titulo !== undefined && { titulo: dto.titulo }),
        ...(dto.contenido !== undefined && { contenido: dto.contenido }),
        ...(dto.icono !== undefined && { icono: dto.icono }),
        ...(dto.banner !== undefined && { banner: dto.banner }),
        ...(dto.orden !== undefined && { orden: dto.orden }),
        ...(dto.parentId !== undefined && { parentId: dto.parentId }),
      },
    });
  }

  async remove(id: number) {
    await this.getById(id);
    await this.prisma.wikiPage.update({
      where: { id },
      data: { activo: false },
    });
  }
}
