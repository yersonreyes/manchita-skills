import { Moneda } from '../projectService/project.req.dto';
import { AttachmentType, EstadoCobro } from './project-income.req.dto';

export interface IngresoAdjuntoResDto {
  id: number;
  nombre: string;
  url: string;
  tipo: AttachmentType;
  size?: number | null;
  createdAt: string;
}

export interface IngresoResDto {
  id: number;
  concepto: string;
  monto: number;
  moneda?: Moneda | null;
  empresaPagadora: string;
  contactoPagadora?: string | null;
  emailPagadora?: string | null;
  numeroFactura?: string | null;
  fechaEmision?: string | null;
  fechaVencimiento: string;
  fechaCobro?: string | null;
  estadoCobro: EstadoCobro;
  notas?: string | null;
  ivaPorcentaje: number;
  valorNeto: number;
  valorIva: number;
  valorBruto: number;
  adjuntos: IngresoAdjuntoResDto[];
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IngresoSummaryResDto {
  totalEsperado: number;
  totalCobrado: number;
  totalPendiente: number;
  totalVencido: number;
  porcentajeCobrado: number;
  ingresos: IngresoResDto[];
}
