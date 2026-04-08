import { Moneda } from '../projectService/project.req.dto';

export type TipoRecurso = 'PERSONA' | 'SERVIDOR' | 'LICENCIA' | 'HERRAMIENTA' | 'SERVICIO' | 'OTRO';
export type FrecuenciaCosto = 'UNICO' | 'SEMANAL' | 'MENSUAL' | 'ANUAL';
export type EstadoPago = 'PENDIENTE' | 'PAGADO' | 'VENCIDO';
export type AttachmentType = 'IMAGE' | 'PDF' | 'LINK' | 'OTHER';

export interface UpdateBudgetReqDto {
  presupuesto?: number;
  moneda?: Moneda;
}

export interface CreateRecursoReqDto {
  nombre: string;
  tipo: TipoRecurso;
  costo: number;
  frecuencia: FrecuenciaCosto;
  cantidad?: number;
  notas?: string;
  fechaInicio?: string;
  duracionMeses?: number;
  esRecurrente?: boolean;
  ivaPorcentaje?: number;
  estadoPago?: EstadoPago;
}

export interface UpdateRecursoReqDto {
  nombre?: string;
  tipo?: TipoRecurso;
  costo?: number;
  frecuencia?: FrecuenciaCosto;
  cantidad?: number;
  notas?: string;
  fechaInicio?: string;
  duracionMeses?: number;
  esRecurrente?: boolean;
  ivaPorcentaje?: number;
  estadoPago?: EstadoPago;
}

export interface CreateAdjuntoReqDto {
  nombre: string;
  url: string;
  tipo: AttachmentType;
  size?: number;
}
