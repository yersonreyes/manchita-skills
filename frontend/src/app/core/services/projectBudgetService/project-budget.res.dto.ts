import { Moneda } from '../projectService/project.req.dto';
import { AttachmentType, EstadoPago, FrecuenciaCosto, TipoRecurso } from './project-budget.req.dto';

export interface AdjuntoResDto {
  id: number;
  nombre: string;
  url: string;
  tipo: AttachmentType;
  size?: number | null;
  createdAt: string;
}

export interface RecursoResDto {
  id: number;
  nombre: string;
  tipo: TipoRecurso;
  costo: number;
  frecuencia: FrecuenciaCosto;
  cantidad: number;
  notas?: string | null;
  activo: boolean;
  fechaInicio?: string | null;
  duracionMeses: number;
  esRecurrente: boolean;
  ivaPorcentaje: number;
  estadoPago: EstadoPago;
  valorNeto: number;
  valorIva: number;
  valorBruto: number;
  costoTotal: number;
  adjuntos: AdjuntoResDto[];
  createdAt: string;
  updatedAt: string;
}

export interface BudgetSummaryResDto {
  presupuesto: number;
  moneda: Moneda | null;
  totalNeto: number;
  totalIva: number;
  totalBruto: number;
  totalAsignado: number;
  saldo: number;
  porcentajeUsado: number;
  recursosPendientes: number;
  recursosPagados: number;
  recursos: RecursoResDto[];
}

export interface DesgloseMensualItemResDto {
  mes: string;
  recursos: RecursoResDto[];
  totalNeto: number;
  totalIva: number;
  totalBruto: number;
}
