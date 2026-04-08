import { Injectable, NotFoundException } from '@nestjs/common';
import { IngresoProyecto } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateIngresoAdjuntoDto,
  CreateIngresoDto,
  UpdateIngresoDto,
} from './dto/project-income.req.dto';

interface IngresoWithAdjuntos extends IngresoProyecto {
  adjuntos: {
    id: number;
    ingresoId: number;
    nombre: string;
    url: string;
    tipo: string;
    size: number | null;
    createdAt: Date;
  }[];
}

function computeIva(ingreso: IngresoWithAdjuntos) {
  const valorNeto = ingreso.monto;
  const valorIva = valorNeto * (ingreso.ivaPorcentaje / 100);
  const valorBruto = valorNeto + valorIva;
  return { ...ingreso, valorNeto, valorIva, valorBruto };
}

@Injectable()
export class ProjectIncomeService {
  constructor(private prisma: PrismaService) {}

  private async findProjectOrFail(projectId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException({
        message: 'Proyecto no encontrado',
        code: 1,
      });
    }
    return project;
  }

  private async findIngresoOrFail(ingresoId: number, projectId: number) {
    const ingreso = await this.prisma.ingresoProyecto.findFirst({
      where: { id: ingresoId, projectId },
    });
    if (!ingreso) {
      throw new NotFoundException({
        message: 'Ingreso no encontrado',
        code: 1,
      });
    }
    return ingreso;
  }

  // ─── GET SUMMARY ──────────────────────────────────────────────────────────
  async getSummary(projectId: number) {
    await this.findProjectOrFail(projectId);

    const ingresos = await this.prisma.ingresoProyecto.findMany({
      where: { projectId, activo: true },
      include: { adjuntos: { orderBy: { createdAt: 'desc' } } },
      orderBy: { fechaVencimiento: 'asc' },
    });

    const enriched = ingresos.map(computeIva);

    const totalEsperado = enriched.reduce((sum, i) => sum + i.valorBruto, 0);
    const totalCobrado = enriched
      .filter((i) => i.estadoCobro === 'COBRADO')
      .reduce((sum, i) => sum + i.valorBruto, 0);
    const totalPendiente = enriched
      .filter((i) => i.estadoCobro === 'PENDIENTE')
      .reduce((sum, i) => sum + i.valorBruto, 0);
    const totalVencido = enriched
      .filter((i) => i.estadoCobro === 'VENCIDO')
      .reduce((sum, i) => sum + i.valorBruto, 0);
    const porcentajeCobrado =
      totalEsperado > 0 ? (totalCobrado / totalEsperado) * 100 : 0;

    return {
      res: {
        totalEsperado,
        totalCobrado,
        totalPendiente,
        totalVencido,
        porcentajeCobrado,
        ingresos: enriched,
      },
      code: 0,
      message: 'Resumen de ingresos obtenido',
    };
  }

  // ─── LIST INGRESOS ────────────────────────────────────────────────────────
  async findAll(projectId: number) {
    await this.findProjectOrFail(projectId);

    const ingresos = await this.prisma.ingresoProyecto.findMany({
      where: { projectId, activo: true },
      include: { adjuntos: { orderBy: { createdAt: 'desc' } } },
      orderBy: { fechaVencimiento: 'asc' },
    });

    return {
      res: ingresos.map(computeIva),
      code: 0,
      message: 'Ingresos obtenidos',
    };
  }

  // ─── CREATE INGRESO ───────────────────────────────────────────────────────
  async create(projectId: number, dto: CreateIngresoDto) {
    await this.findProjectOrFail(projectId);

    const ingreso = await this.prisma.ingresoProyecto.create({
      data: {
        projectId,
        concepto: dto.concepto.trim(),
        monto: dto.monto,
        moneda: dto.moneda ?? null,
        empresaPagadora: dto.empresaPagadora.trim(),
        contactoPagadora: dto.contactoPagadora?.trim() ?? null,
        emailPagadora: dto.emailPagadora?.trim() ?? null,
        numeroFactura: dto.numeroFactura?.trim() ?? null,
        fechaEmision: dto.fechaEmision ? new Date(dto.fechaEmision) : null,
        fechaVencimiento: new Date(dto.fechaVencimiento),
        fechaCobro: dto.fechaCobro ? new Date(dto.fechaCobro) : null,
        estadoCobro: dto.estadoCobro ?? 'PENDIENTE',
        notas: dto.notas?.trim() ?? null,
        ivaPorcentaje: dto.ivaPorcentaje ?? 0,
      },
      include: { adjuntos: true },
    });

    return {
      res: computeIva(ingreso),
      code: 0,
      message: 'Ingreso creado correctamente',
    };
  }

  // ─── UPDATE INGRESO ───────────────────────────────────────────────────────
  async update(projectId: number, ingresoId: number, dto: UpdateIngresoDto) {
    await this.findIngresoOrFail(ingresoId, projectId);

    const data: any = {};
    if (dto.concepto !== undefined) data.concepto = dto.concepto.trim();
    if (dto.monto !== undefined) data.monto = dto.monto;
    if (dto.moneda !== undefined) data.moneda = dto.moneda;
    if (dto.empresaPagadora !== undefined)
      data.empresaPagadora = dto.empresaPagadora.trim();
    if (dto.contactoPagadora !== undefined)
      data.contactoPagadora = dto.contactoPagadora?.trim() ?? null;
    if (dto.emailPagadora !== undefined)
      data.emailPagadora = dto.emailPagadora?.trim() ?? null;
    if (dto.numeroFactura !== undefined)
      data.numeroFactura = dto.numeroFactura?.trim() ?? null;
    if (dto.fechaEmision !== undefined)
      data.fechaEmision = dto.fechaEmision ? new Date(dto.fechaEmision) : null;
    if (dto.fechaVencimiento !== undefined)
      data.fechaVencimiento = new Date(dto.fechaVencimiento);
    if (dto.fechaCobro !== undefined)
      data.fechaCobro = dto.fechaCobro ? new Date(dto.fechaCobro) : null;
    if (dto.estadoCobro !== undefined) data.estadoCobro = dto.estadoCobro;
    if (dto.notas !== undefined) data.notas = dto.notas?.trim() ?? null;
    if (dto.ivaPorcentaje !== undefined) data.ivaPorcentaje = dto.ivaPorcentaje;

    const updated = await this.prisma.ingresoProyecto.update({
      where: { id: ingresoId },
      data,
      include: { adjuntos: true },
    });

    return {
      res: computeIva(updated),
      code: 0,
      message: 'Ingreso actualizado correctamente',
    };
  }

  // ─── DELETE INGRESO ───────────────────────────────────────────────────────
  async remove(projectId: number, ingresoId: number) {
    await this.findIngresoOrFail(ingresoId, projectId);
    await this.prisma.ingresoProyecto.update({
      where: { id: ingresoId },
      data: { activo: false },
    });
    return { res: null, code: 0, message: 'Ingreso eliminado correctamente' };
  }

  // ─── CREATE ADJUNTO ───────────────────────────────────────────────────────
  async createAdjunto(
    projectId: number,
    ingresoId: number,
    dto: CreateIngresoAdjuntoDto,
  ) {
    await this.findIngresoOrFail(ingresoId, projectId);

    const adjunto = await this.prisma.ingresoAdjunto.create({
      data: {
        ingresoId,
        nombre: dto.nombre.trim(),
        url: dto.url,
        tipo: dto.tipo,
        size: dto.size ?? null,
      },
    });

    return {
      res: adjunto,
      code: 0,
      message: 'Adjunto creado correctamente',
    };
  }

  // ─── DELETE ADJUNTO ───────────────────────────────────────────────────────
  async deleteAdjunto(projectId: number, ingresoId: number, adjuntoId: number) {
    await this.findIngresoOrFail(ingresoId, projectId);

    const adjunto = await this.prisma.ingresoAdjunto.findFirst({
      where: { id: adjuntoId, ingresoId },
    });
    if (!adjunto) {
      throw new NotFoundException({
        message: 'Adjunto no encontrado',
        code: 1,
      });
    }

    await this.prisma.ingresoAdjunto.delete({ where: { id: adjuntoId } });

    return { res: null, code: 0, message: 'Adjunto eliminado correctamente' };
  }
}
