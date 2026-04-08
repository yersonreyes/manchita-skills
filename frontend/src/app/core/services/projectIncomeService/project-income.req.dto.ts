import { Moneda } from '../projectService/project.req.dto';

export type EstadoCobro = 'PENDIENTE' | 'COBRADO' | 'VENCIDO';
export type AttachmentType = 'IMAGE' | 'PDF' | 'LINK' | 'OTHER';

export interface CreateIngresoReqDto {
  concepto: string;
  monto: number;
  moneda?: Moneda;
  empresaPagadora: string;
  contactoPagadora?: string;
  emailPagadora?: string;
  numeroFactura?: string;
  fechaEmision?: string;
  fechaVencimiento: string;
  fechaCobro?: string;
  estadoCobro?: EstadoCobro;
  notas?: string;
  ivaPorcentaje?: number;
}

export interface UpdateIngresoReqDto {
  concepto?: string;
  monto?: number;
  moneda?: Moneda;
  empresaPagadora?: string;
  contactoPagadora?: string;
  emailPagadora?: string;
  numeroFactura?: string;
  fechaEmision?: string;
  fechaVencimiento?: string;
  fechaCobro?: string;
  estadoCobro?: EstadoCobro;
  notas?: string;
  ivaPorcentaje?: number;
}

export interface CreateIngresoAdjuntoReqDto {
  nombre: string;
  url: string;
  tipo: AttachmentType;
  size?: number;
}
