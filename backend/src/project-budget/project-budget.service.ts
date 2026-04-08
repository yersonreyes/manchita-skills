import { Injectable, NotFoundException } from '@nestjs/common';
import { RecursoProyecto } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateAdjuntoDto,
  CreateRecursoDto,
  UpdateBudgetDto,
  UpdateRecursoDto,
} from './dto/project-budget.req.dto';

interface RecursoWithAdjuntos extends RecursoProyecto {
  adjuntos: {
    id: number;
    recursoId: number;
    nombre: string;
    url: string;
    tipo: string;
    size: number | null;
    createdAt: Date;
  }[];
}

function computeIva(recurso: RecursoWithAdjuntos) {
  const valorNeto = recurso.costo;
  const valorIva = valorNeto * (recurso.ivaPorcentaje / 100);
  const valorBruto = valorNeto + valorIva;
  const costoTotal = valorBruto * recurso.cantidad;
  return { ...recurso, valorNeto, valorIva, valorBruto, costoTotal };
}

@Injectable()
export class ProjectBudgetService {
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

  private async findRecursoOrFail(recursoId: number, projectId: number) {
    const recurso = await this.prisma.recursoProyecto.findFirst({
      where: { id: recursoId, projectId },
    });
    if (!recurso) {
      throw new NotFoundException({
        message: 'Recurso no encontrado',
        code: 1,
      });
    }
    return recurso;
  }

  // ─── UPDATE BUDGET ────────────────────────────────────────────────────────
  async updateBudget(projectId: number, dto: UpdateBudgetDto) {
    await this.findProjectOrFail(projectId);

    const data: any = {};
    if (dto.presupuesto !== undefined) data.presupuesto = dto.presupuesto;
    if (dto.moneda !== undefined) data.moneda = dto.moneda;

    await this.prisma.project.update({ where: { id: projectId }, data });

    return this.getSummary(projectId);
  }

  // ─── GET SUMMARY ──────────────────────────────────────────────────────────
  async getSummary(projectId: number) {
    const project = await this.findProjectOrFail(projectId);

    const recursos = await this.prisma.recursoProyecto.findMany({
      where: { projectId, activo: true },
      include: { adjuntos: { orderBy: { createdAt: 'desc' } } },
      orderBy: { createdAt: 'asc' },
    });

    const enriched = recursos.map(computeIva);

    const totalNeto = enriched.reduce(
      (sum, r) => sum + r.valorNeto * r.cantidad,
      0,
    );
    const totalIva = enriched.reduce(
      (sum, r) => sum + r.valorIva * r.cantidad,
      0,
    );
    const totalBruto = enriched.reduce((sum, r) => sum + r.costoTotal, 0);
    const presupuesto = project.presupuesto ?? 0;
    const saldo = presupuesto - totalBruto;
    const porcentajeUsado =
      presupuesto > 0 ? (totalBruto / presupuesto) * 100 : 0;

    const recursosPendientes = enriched.filter(
      (r) => r.estadoPago === 'PENDIENTE',
    ).length;
    const recursosPagados = enriched.filter(
      (r) => r.estadoPago === 'PAGADO',
    ).length;

    return {
      res: {
        presupuesto,
        moneda: project.moneda,
        totalNeto,
        totalIva,
        totalBruto,
        totalAsignado: totalBruto,
        saldo,
        porcentajeUsado,
        recursosPendientes,
        recursosPagados,
        recursos: enriched,
      },
      code: 0,
      message: 'Resumen de presupuesto obtenido',
    };
  }

  // ─── DESGLOSE MENSUAL ─────────────────────────────────────────────────────
  async getDesgloseMensual(projectId: number) {
    await this.findProjectOrFail(projectId);

    const recursos = await this.prisma.recursoProyecto.findMany({
      where: { projectId, activo: true },
      include: { adjuntos: { orderBy: { createdAt: 'desc' } } },
      orderBy: { createdAt: 'asc' },
    });

    const enriched = recursos.map(computeIva);

    // Collect all months where resources apply
    const monthSet = new Set<string>();
    for (const r of enriched) {
      if (!r.fechaInicio) continue;
      const start = new Date(r.fechaInicio);
      const months = r.esRecurrente ? r.duracionMeses : 1;
      for (let i = 0; i < months; i++) {
        const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
        monthSet.add(
          `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        );
      }
    }

    const sortedMonths = [...monthSet].sort();

    const desglose = sortedMonths.map((mes) => {
      const [year, month] = mes.split('-').map(Number);
      const monthDate = new Date(year, month - 1, 1);

      const aplicables = enriched.filter((r) => {
        if (!r.fechaInicio) return false;
        const start = new Date(r.fechaInicio);
        const startMonth = new Date(start.getFullYear(), start.getMonth(), 1);

        if (r.esRecurrente) {
          const endMonth = new Date(
            start.getFullYear(),
            start.getMonth() + r.duracionMeses,
            1,
          );
          return monthDate >= startMonth && monthDate < endMonth;
        }

        // Non-recurring: only applies in its start month
        return (
          monthDate.getFullYear() === startMonth.getFullYear() &&
          monthDate.getMonth() === startMonth.getMonth()
        );
      });

      const totalNeto = aplicables.reduce(
        (sum, r) => sum + r.valorNeto * r.cantidad,
        0,
      );
      const totalIva = aplicables.reduce(
        (sum, r) => sum + r.valorIva * r.cantidad,
        0,
      );
      const totalBruto = aplicables.reduce((sum, r) => sum + r.costoTotal, 0);

      return { mes, recursos: aplicables, totalNeto, totalIva, totalBruto };
    });

    return {
      res: desglose,
      code: 0,
      message: 'Desglose mensual obtenido',
    };
  }

  // ─── CREATE RECURSO ───────────────────────────────────────────────────────
  async createRecurso(projectId: number, dto: CreateRecursoDto) {
    await this.findProjectOrFail(projectId);

    const recurso = await this.prisma.recursoProyecto.create({
      data: {
        projectId,
        nombre: dto.nombre.trim(),
        tipo: dto.tipo,
        costo: dto.costo,
        frecuencia: dto.frecuencia,
        cantidad: dto.cantidad ?? 1,
        notas: dto.notas?.trim() ?? null,
        fechaInicio: dto.fechaInicio ? new Date(dto.fechaInicio) : null,
        duracionMeses: dto.duracionMeses ?? 1,
        esRecurrente: dto.esRecurrente ?? false,
        ivaPorcentaje: dto.ivaPorcentaje ?? 0,
        estadoPago: dto.estadoPago ?? 'PENDIENTE',
      },
      include: { adjuntos: true },
    });

    return {
      res: computeIva(recurso),
      code: 0,
      message: 'Recurso creado correctamente',
    };
  }

  // ─── UPDATE RECURSO ───────────────────────────────────────────────────────
  async updateRecurso(
    projectId: number,
    recursoId: number,
    dto: UpdateRecursoDto,
  ) {
    await this.findRecursoOrFail(recursoId, projectId);

    const data: any = {};
    if (dto.nombre !== undefined) data.nombre = dto.nombre.trim();
    if (dto.tipo !== undefined) data.tipo = dto.tipo;
    if (dto.costo !== undefined) data.costo = dto.costo;
    if (dto.frecuencia !== undefined) data.frecuencia = dto.frecuencia;
    if (dto.cantidad !== undefined) data.cantidad = dto.cantidad;
    if (dto.notas !== undefined) data.notas = dto.notas?.trim() ?? null;
    if (dto.fechaInicio !== undefined)
      data.fechaInicio = dto.fechaInicio ? new Date(dto.fechaInicio) : null;
    if (dto.duracionMeses !== undefined) data.duracionMeses = dto.duracionMeses;
    if (dto.esRecurrente !== undefined) data.esRecurrente = dto.esRecurrente;
    if (dto.ivaPorcentaje !== undefined) data.ivaPorcentaje = dto.ivaPorcentaje;
    if (dto.estadoPago !== undefined) data.estadoPago = dto.estadoPago;

    const updated = await this.prisma.recursoProyecto.update({
      where: { id: recursoId },
      data,
      include: { adjuntos: true },
    });

    return {
      res: computeIva(updated),
      code: 0,
      message: 'Recurso actualizado correctamente',
    };
  }

  // ─── DELETE RECURSO ───────────────────────────────────────────────────────
  async deleteRecurso(projectId: number, recursoId: number) {
    await this.findRecursoOrFail(recursoId, projectId);
    await this.prisma.recursoProyecto.delete({ where: { id: recursoId } });
    return { res: null, code: 0, message: 'Recurso eliminado correctamente' };
  }

  // ─── CREATE ADJUNTO ───────────────────────────────────────────────────────
  async createAdjunto(
    projectId: number,
    recursoId: number,
    dto: CreateAdjuntoDto,
  ) {
    await this.findRecursoOrFail(recursoId, projectId);

    const adjunto = await this.prisma.recursoAdjunto.create({
      data: {
        recursoId,
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
  async deleteAdjunto(projectId: number, recursoId: number, adjuntoId: number) {
    await this.findRecursoOrFail(recursoId, projectId);

    const adjunto = await this.prisma.recursoAdjunto.findFirst({
      where: { id: adjuntoId, recursoId },
    });
    if (!adjunto) {
      throw new NotFoundException({
        message: 'Adjunto no encontrado',
        code: 1,
      });
    }

    await this.prisma.recursoAdjunto.delete({ where: { id: adjuntoId } });

    return { res: null, code: 0, message: 'Adjunto eliminado correctamente' };
  }
}
