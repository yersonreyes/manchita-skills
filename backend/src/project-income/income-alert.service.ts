import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class IncomeAlertService {
  private readonly logger = new Logger(IncomeAlertService.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleIncomeAlerts() {
    this.logger.log('Ejecutando chequeo de ingresos vencidos y próximos...');

    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);

    // Mark overdue incomes as VENCIDO
    await this.prisma.ingresoProyecto.updateMany({
      where: {
        estadoCobro: 'PENDIENTE',
        fechaVencimiento: { lt: now },
        activo: true,
      },
      data: { estadoCobro: 'VENCIDO' },
    });

    // Find incomes that are due soon or overdue
    const alertIngresos = await this.prisma.ingresoProyecto.findMany({
      where: {
        activo: true,
        OR: [
          {
            estadoCobro: 'PENDIENTE',
            fechaVencimiento: { gte: now, lte: threeDaysFromNow },
          },
          { estadoCobro: 'VENCIDO' },
        ],
      },
      include: {
        project: {
          include: {
            owner: { select: { email: true, nombre: true } },
          },
        },
      },
      orderBy: { fechaVencimiento: 'asc' },
    });

    if (alertIngresos.length === 0) {
      this.logger.log('No hay ingresos por alertar.');
      return;
    }

    // Group by project
    const byProject = new Map<
      number,
      { projectName: string; ownerEmail: string; ownerName: string; items: typeof alertIngresos }
    >();

    for (const ingreso of alertIngresos) {
      const projectId = ingreso.projectId;
      if (!byProject.has(projectId)) {
        byProject.set(projectId, {
          projectName: ingreso.project.nombre,
          ownerEmail: ingreso.project.owner.email,
          ownerName: ingreso.project.owner.nombre,
          items: [],
        });
      }
      byProject.get(projectId)!.items.push(ingreso);
    }

    // Send email per project
    for (const [projectId, data] of byProject) {
      const rows = data.items
        .map((i) => {
          const estado = i.estadoCobro === 'VENCIDO' ? '🔴 Vencido' : '🟡 Próximo';
          const fecha = i.fechaVencimiento.toISOString().split('T')[0];
          return `<tr>
            <td style="padding:8px;border-bottom:1px solid #eee">${i.concepto}</td>
            <td style="padding:8px;border-bottom:1px solid #eee">${i.empresaPagadora}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">$${i.monto.toLocaleString()}</td>
            <td style="padding:8px;border-bottom:1px solid #eee">${fecha}</td>
            <td style="padding:8px;border-bottom:1px solid #eee">${estado}</td>
          </tr>`;
        })
        .join('');

      const html = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#333">Pagos pendientes — ${data.projectName}</h2>
          <p>Hola ${data.ownerName},</p>
          <p>Estos ingresos requieren tu atención:</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <thead>
              <tr style="background:#f5f5f5">
                <th style="padding:8px;text-align:left">Concepto</th>
                <th style="padding:8px;text-align:left">Empresa</th>
                <th style="padding:8px;text-align:right">Monto</th>
                <th style="padding:8px;text-align:left">Vencimiento</th>
                <th style="padding:8px;text-align:left">Estado</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;

      try {
        await this.mailService.sendMail({
          to: data.ownerEmail,
          subject: `Pagos pendientes en ${data.projectName}`,
          text: `Tenés ${data.items.length} pago(s) pendiente(s) o vencido(s) en el proyecto ${data.projectName}.`,
          html,
        });
        this.logger.log(`Alerta enviada a ${data.ownerEmail} para proyecto #${projectId}`);
      } catch (error) {
        this.logger.error(`Error enviando alerta para proyecto #${projectId}:`, error);
      }
    }
  }
}
