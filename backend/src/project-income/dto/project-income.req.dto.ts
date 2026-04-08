import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { AttachmentType, EstadoCobro, Moneda } from '@prisma/client';

export class CreateIngresoDto {
  @ApiProperty({ example: 'Pago inicial — Diseño UX' })
  @IsString()
  concepto: string;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  @Min(0)
  monto: number;

  @ApiProperty({ enum: Moneda, required: false })
  @IsEnum(Moneda)
  @IsOptional()
  moneda?: Moneda;

  @ApiProperty({ example: 'Acme Corp' })
  @IsString()
  empresaPagadora: string;

  @ApiProperty({ required: false, example: 'Juan Pérez' })
  @IsString()
  @IsOptional()
  contactoPagadora?: string;

  @ApiProperty({ required: false, example: 'juan@acme.com' })
  @IsEmail()
  @IsOptional()
  emailPagadora?: string;

  @ApiProperty({ required: false, example: 'FAC-2026-001' })
  @IsString()
  @IsOptional()
  numeroFactura?: string;

  @ApiProperty({ required: false, example: '2026-04-01T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  fechaEmision?: string;

  @ApiProperty({ example: '2026-04-30T00:00:00.000Z' })
  @IsDateString()
  fechaVencimiento: string;

  @ApiProperty({ required: false, example: '2026-04-28T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  fechaCobro?: string;

  @ApiProperty({ enum: EstadoCobro, required: false, default: 'PENDIENTE' })
  @IsEnum(EstadoCobro)
  @IsOptional()
  estadoCobro?: EstadoCobro;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notas?: string;

  @ApiProperty({ required: false, default: 0, example: 19 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  ivaPorcentaje?: number;
}

export class UpdateIngresoDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  concepto?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  monto?: number;

  @ApiProperty({ enum: Moneda, required: false })
  @IsEnum(Moneda)
  @IsOptional()
  moneda?: Moneda;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  empresaPagadora?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  contactoPagadora?: string;

  @ApiProperty({ required: false })
  @IsEmail()
  @IsOptional()
  emailPagadora?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  numeroFactura?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  fechaEmision?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  fechaVencimiento?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  fechaCobro?: string;

  @ApiProperty({ enum: EstadoCobro, required: false })
  @IsEnum(EstadoCobro)
  @IsOptional()
  estadoCobro?: EstadoCobro;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notas?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  ivaPorcentaje?: number;
}

export class CreateIngresoAdjuntoDto {
  @ApiProperty({ example: 'Factura Abril 2026.pdf' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: 'https://s3.amazonaws.com/...' })
  @IsString()
  url: string;

  @ApiProperty({ enum: AttachmentType })
  @IsEnum(AttachmentType)
  tipo: AttachmentType;

  @ApiProperty({ required: false, example: 102400 })
  @IsInt()
  @IsOptional()
  size?: number;
}
