import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateToolApplicationAttachmentRequestDto,
  CreateToolApplicationNoteRequestDto,
  CreateToolApplicationRequestDto,
  UpdateToolApplicationNoteRequestDto,
  UpdateToolApplicationRequestDto,
} from './dto/tool-application.req.dto';

const APPLICATION_INCLUDE = {
  tool: true,
  projectPhase: {
    include: { phase: true },
  },
  createdBy: {
    select: { id: true, nombre: true, email: true },
  },
  notes: {
    include: {
      createdBy: { select: { id: true, nombre: true } },
    },
    orderBy: { createdAt: 'asc' as const },
  },
  attachments: {
    include: {
      createdBy: { select: { id: true, nombre: true } },
    },
    orderBy: { createdAt: 'asc' as const },
  },
};

@Injectable()
export class ToolApplicationService {
  constructor(private prisma: PrismaService) {}

  // ─── CREATE ───────────────────────────────────────────────────────────────
  async create(dto: CreateToolApplicationRequestDto, createdById: number) {
    const projectPhase = await this.prisma.projectPhase.findUnique({
      where: { id: dto.projectPhaseId },
    });
    if (!projectPhase) {
      throw new NotFoundException({ message: 'Fase de proyecto no encontrada', code: 1 });
    }

    const tool = await this.prisma.tool.findUnique({ where: { id: dto.toolId } });
    if (!tool) {
      throw new NotFoundException({ message: 'Herramienta no encontrada', code: 1 });
    }

    const res = await this.prisma.toolApplication.create({
      data: {
        projectPhaseId: dto.projectPhaseId,
        toolId: dto.toolId,
        titulo: dto.titulo.trim(),
        structuredData: dto.structuredData ?? {},
        estado: dto.estado ?? 'PENDING',
        createdById,
      },
      include: APPLICATION_INCLUDE,
    });

    return { res, code: 0, message: 'Aplicación de herramienta creada correctamente' };
  }

  // ─── FIND BY PROJECT PHASE ────────────────────────────────────────────────
  async findByProjectPhase(projectPhaseId: number) {
    const projectPhase = await this.prisma.projectPhase.findUnique({
      where: { id: projectPhaseId },
    });
    if (!projectPhase) {
      throw new NotFoundException({ message: 'Fase de proyecto no encontrada', code: 1 });
    }

    const res = await this.prisma.toolApplication.findMany({
      where: { projectPhaseId },
      include: APPLICATION_INCLUDE,
      orderBy: { createdAt: 'asc' },
    });

    if (res.length === 0) {
      throw new NotFoundException({
        message: 'No se encontraron aplicaciones de herramientas para esta fase',
        code: 1,
      });
    }

    return { res, code: 0, message: 'Aplicaciones encontradas' };
  }

  // ─── FIND ONE ─────────────────────────────────────────────────────────────
  async findOne(id: number) {
    const res = await this.prisma.toolApplication.findUnique({
      where: { id },
      include: APPLICATION_INCLUDE,
    });

    if (!res) {
      throw new NotFoundException({
        message: 'Aplicación de herramienta no encontrada',
        code: 1,
      });
    }

    return { res, code: 0, message: 'Aplicación encontrada' };
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  async update(id: number, dto: UpdateToolApplicationRequestDto) {
    const existing = await this.prisma.toolApplication.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException({
        message: 'Aplicación de herramienta no encontrada',
        code: 1,
      });
    }

    const data: any = {};

    if (dto.titulo !== undefined) data.titulo = dto.titulo.trim();
    if (dto.structuredData !== undefined) data.structuredData = dto.structuredData;
    if (dto.estado !== undefined) data.estado = dto.estado;

    if (Object.keys(data).length === 0) {
      const current = await this.prisma.toolApplication.findUnique({
        where: { id },
        include: APPLICATION_INCLUDE,
      });
      return { res: current, code: 0, message: 'No hay cambios para actualizar' };
    }

    const res = await this.prisma.toolApplication.update({
      where: { id },
      data,
      include: APPLICATION_INCLUDE,
    });

    return { res, code: 0, message: 'Aplicación actualizada correctamente' };
  }

  // ─── ADD NOTE ─────────────────────────────────────────────────────────────
  async addNote(
    applicationId: number,
    dto: CreateToolApplicationNoteRequestDto,
    createdById: number,
  ) {
    const application = await this.prisma.toolApplication.findUnique({
      where: { id: applicationId },
    });
    if (!application) {
      throw new NotFoundException({
        message: 'Aplicación de herramienta no encontrada',
        code: 1,
      });
    }

    const res = await this.prisma.toolApplicationNote.create({
      data: {
        toolApplicationId: applicationId,
        contenido: dto.contenido.trim(),
        createdById,
      },
      include: {
        createdBy: { select: { id: true, nombre: true } },
      },
    });

    return { res, code: 0, message: 'Nota añadida correctamente' };
  }

  // ─── UPDATE NOTE ──────────────────────────────────────────────────────────
  async updateNote(noteId: number, dto: UpdateToolApplicationNoteRequestDto) {
    const note = await this.prisma.toolApplicationNote.findUnique({
      where: { id: noteId },
    });
    if (!note) {
      throw new NotFoundException({ message: 'Nota no encontrada', code: 1 });
    }

    const res = await this.prisma.toolApplicationNote.update({
      where: { id: noteId },
      data: { contenido: dto.contenido.trim() },
      include: {
        createdBy: { select: { id: true, nombre: true } },
      },
    });

    return { res, code: 0, message: 'Nota actualizada correctamente' };
  }

  // ─── DELETE NOTE ──────────────────────────────────────────────────────────
  async deleteNote(noteId: number) {
    const note = await this.prisma.toolApplicationNote.findUnique({
      where: { id: noteId },
    });
    if (!note) {
      throw new NotFoundException({ message: 'Nota no encontrada', code: 1 });
    }

    await this.prisma.toolApplicationNote.delete({ where: { id: noteId } });

    return { res: null, code: 0, message: 'Nota eliminada correctamente' };
  }

  // ─── ADD ATTACHMENT ───────────────────────────────────────────────────────
  async addAttachment(
    applicationId: number,
    dto: CreateToolApplicationAttachmentRequestDto,
    createdById: number,
  ) {
    const application = await this.prisma.toolApplication.findUnique({
      where: { id: applicationId },
    });
    if (!application) {
      throw new NotFoundException({
        message: 'Aplicación de herramienta no encontrada',
        code: 1,
      });
    }

    const res = await this.prisma.toolApplicationAttachment.create({
      data: {
        toolApplicationId: applicationId,
        nombre: dto.nombre.trim(),
        url: dto.url.trim(),
        tipo: dto.tipo,
        size: dto.size ?? null,
        createdById,
      },
      include: {
        createdBy: { select: { id: true, nombre: true } },
      },
    });

    return { res, code: 0, message: 'Adjunto añadido correctamente' };
  }

  // ─── DELETE ATTACHMENT ────────────────────────────────────────────────────
  async deleteAttachment(attachmentId: number) {
    const attachment = await this.prisma.toolApplicationAttachment.findUnique({
      where: { id: attachmentId },
    });
    if (!attachment) {
      throw new NotFoundException({ message: 'Adjunto no encontrado', code: 1 });
    }

    await this.prisma.toolApplicationAttachment.delete({
      where: { id: attachmentId },
    });

    return { res: null, code: 0, message: 'Adjunto eliminado correctamente' };
  }
}
