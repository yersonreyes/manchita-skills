import { ApiProperty } from '@nestjs/swagger';
import {
  AttachmentType,
  EstadoPago,
  FrecuenciaCosto,
  Moneda,
  TipoRecurso,
} from '@prisma/client';

export class AdjuntoDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  nombre: string;

  @ApiProperty()
  url: string;

  @ApiProperty({ enum: AttachmentType })
  tipo: AttachmentType;

  @ApiProperty({ required: false })
  size?: number | null;

  @ApiProperty()
  createdAt: Date;
}

export class RecursoDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  nombre: string;

  @ApiProperty({ enum: TipoRecurso })
  tipo: TipoRecurso;

  @ApiProperty()
  costo: number;

  @ApiProperty({ enum: FrecuenciaCosto })
  frecuencia: FrecuenciaCosto;

  @ApiProperty()
  cantidad: number;

  @ApiProperty({ required: false })
  notas?: string | null;

  @ApiProperty()
  activo: boolean;

  @ApiProperty({ required: false })
  fechaInicio?: Date | null;

  @ApiProperty()
  duracionMeses: number;

  @ApiProperty()
  esRecurrente: boolean;

  @ApiProperty()
  ivaPorcentaje: number;

  @ApiProperty({ enum: EstadoPago })
  estadoPago: EstadoPago;

  @ApiProperty()
  valorNeto: number;

  @ApiProperty()
  valorIva: number;

  @ApiProperty()
  valorBruto: number;

  @ApiProperty()
  costoTotal: number;

  @ApiProperty({ type: () => [AdjuntoDto] })
  adjuntos: AdjuntoDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class BudgetSummaryDto {
  @ApiProperty()
  presupuesto: number;

  @ApiProperty({ enum: Moneda, required: false })
  moneda: Moneda | null;

  @ApiProperty()
  totalNeto: number;

  @ApiProperty()
  totalIva: number;

  @ApiProperty()
  totalBruto: number;

  @ApiProperty()
  totalAsignado: number;

  @ApiProperty()
  saldo: number;

  @ApiProperty()
  porcentajeUsado: number;

  @ApiProperty()
  recursosPendientes: number;

  @ApiProperty()
  recursosPagados: number;

  @ApiProperty({ type: () => [RecursoDto] })
  recursos: RecursoDto[];
}

export class DesgloseMensualItemDto {
  @ApiProperty({ example: '2026-01' })
  mes: string;

  @ApiProperty({ type: () => [RecursoDto] })
  recursos: RecursoDto[];

  @ApiProperty()
  totalNeto: number;

  @ApiProperty()
  totalIva: number;

  @ApiProperty()
  totalBruto: number;
}

export class BudgetSummaryResponseDto {
  @ApiProperty({ type: () => BudgetSummaryDto })
  res: BudgetSummaryDto;

  @ApiProperty()
  message: string;

  @ApiProperty()
  code: number;
}

export class RecursoResponseDto {
  @ApiProperty({ type: () => RecursoDto })
  res: RecursoDto;

  @ApiProperty()
  message: string;

  @ApiProperty()
  code: number;
}

export class AdjuntoResponseDto {
  @ApiProperty({ type: () => AdjuntoDto })
  res: AdjuntoDto;

  @ApiProperty()
  message: string;

  @ApiProperty()
  code: number;
}

export class DesgloseMensualResponseDto {
  @ApiProperty({ type: () => [DesgloseMensualItemDto] })
  res: DesgloseMensualItemDto[];

  @ApiProperty()
  message: string;

  @ApiProperty()
  code: number;
}
