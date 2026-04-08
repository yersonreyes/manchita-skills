import { ApiProperty } from '@nestjs/swagger';
import { AttachmentType, EstadoCobro, Moneda } from '@prisma/client';

export class IngresoAdjuntoDto {
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

export class IngresoDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  concepto: string;

  @ApiProperty()
  monto: number;

  @ApiProperty({ enum: Moneda, required: false })
  moneda?: Moneda | null;

  @ApiProperty()
  empresaPagadora: string;

  @ApiProperty({ required: false })
  contactoPagadora?: string | null;

  @ApiProperty({ required: false })
  emailPagadora?: string | null;

  @ApiProperty({ required: false })
  numeroFactura?: string | null;

  @ApiProperty({ required: false })
  fechaEmision?: Date | null;

  @ApiProperty()
  fechaVencimiento: Date;

  @ApiProperty({ required: false })
  fechaCobro?: Date | null;

  @ApiProperty({ enum: EstadoCobro })
  estadoCobro: EstadoCobro;

  @ApiProperty({ required: false })
  notas?: string | null;

  @ApiProperty()
  ivaPorcentaje: number;

  @ApiProperty()
  valorNeto: number;

  @ApiProperty()
  valorIva: number;

  @ApiProperty()
  valorBruto: number;

  @ApiProperty({ type: () => [IngresoAdjuntoDto] })
  adjuntos: IngresoAdjuntoDto[];

  @ApiProperty()
  activo: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class IngresoSummaryDto {
  @ApiProperty()
  totalEsperado: number;

  @ApiProperty()
  totalCobrado: number;

  @ApiProperty()
  totalPendiente: number;

  @ApiProperty()
  totalVencido: number;

  @ApiProperty()
  porcentajeCobrado: number;

  @ApiProperty({ type: () => [IngresoDto] })
  ingresos: IngresoDto[];
}

export class IngresoSummaryResponseDto {
  @ApiProperty({ type: () => IngresoSummaryDto })
  res: IngresoSummaryDto;

  @ApiProperty()
  message: string;

  @ApiProperty()
  code: number;
}

export class IngresoResponseDto {
  @ApiProperty({ type: () => IngresoDto })
  res: IngresoDto;

  @ApiProperty()
  message: string;

  @ApiProperty()
  code: number;
}

export class IngresoAdjuntoResponseDto {
  @ApiProperty({ type: () => IngresoAdjuntoDto })
  res: IngresoAdjuntoDto;

  @ApiProperty()
  message: string;

  @ApiProperty()
  code: number;
}
