import { IsInt, IsNotEmpty, IsObject, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class BmcBlockFieldsDto {
  @ApiProperty({ example: '' })
  @IsString()
  field1: string;

  @ApiProperty({ example: '' })
  @IsString()
  field2: string;

  @ApiProperty({ example: '' })
  @IsString()
  field3: string;
}

export class BmcPropuestaDeValorDto {
  @ApiProperty({ example: 'Los clientes no tienen cómo...' })
  @IsString()
  problemasQueResuelve: string;

  @ApiProperty({ example: 'Reducen tiempo y costos' })
  @IsString()
  beneficiosClave: string;

  @ApiProperty({ example: 'Plataforma SaaS de gestión' })
  @IsString()
  productoServicio: string;
}

export class BmcSegmentosDeClientesDto {
  @ApiProperty({ example: 'Pymes del sector retail' })
  @IsString()
  clientePrincipal: string;

  @ApiProperty({ example: 'Empresas de 5-50 empleados, Argentina' })
  @IsString()
  caracteristicas: string;

  @ApiProperty({ example: 'Necesitan optimizar su inventario' })
  @IsString()
  necesidadQueResuelves: string;
}

export class BmcCanalesDto {
  @ApiProperty({ example: 'Venta directa y marketplace' })
  @IsString()
  comoLlegasAlCliente: string;

  @ApiProperty({ example: 'Adquisición y retención' })
  @IsString()
  etapaDelFunnel: string;

  @ApiProperty({ example: 'Sí, bajo costo de adquisición digital' })
  @IsString()
  costoEficiencia: string;
}

export class BmcRelacionesConClientesDto {
  @ApiProperty({ example: 'Self-service con soporte' })
  @IsString()
  tipoDeRelacion: string;

  @ApiProperty({ example: 'Marketing digital y referidos' })
  @IsString()
  adquisicion: string;

  @ApiProperty({ example: 'Onboarding guiado y emails automáticos' })
  @IsString()
  retencion: string;
}

export class BmcFuentesDeIngresoDto {
  @ApiProperty({ example: 'Suscripción mensual' })
  @IsString()
  comoGenerasIngresos: string;

  @ApiProperty({ example: 'Freemium con planes pagos' })
  @IsString()
  modeloDePrecio: string;

  @ApiProperty({ example: 'Entre $20 y $100 USD/mes' })
  @IsString()
  disposicionAPagar: string;
}

export class BmcRecursosClavesDto {
  @ApiProperty({ example: 'Plataforma cloud, equipo dev, datos' })
  @IsString()
  recursosNecesarios: string;

  @ApiProperty({ example: 'Tecnológicos e intelectuales' })
  @IsString()
  tipoDeRecurso: string;

  @ApiProperty({ example: 'El algoritmo de recomendación' })
  @IsString()
  masCritico: string;
}

export class BmcActividadesClavesDto {
  @ApiProperty({ example: 'Desarrollo de producto y soporte' })
  @IsString()
  actividadesPrincipales: string;

  @ApiProperty({ example: 'Plataforma' })
  @IsString()
  produccionVsServicio: string;

  @ApiProperty({ example: 'Experiencia de usuario superior' })
  @IsString()
  diferenciadoras: string;
}

export class BmcAsociacionesClavesDto {
  @ApiProperty({ example: 'AWS, pasarela de pagos, contadores' })
  @IsString()
  sociosPrincipales: string;

  @ApiProperty({ example: 'Infraestructura cloud y pagos' })
  @IsString()
  queTercerizan: string;

  @ApiProperty({ example: 'Reducción de riesgo y acceso a recursos' })
  @IsString()
  motivacion: string;
}

export class BmcEstructuraDeCostosDto {
  @ApiProperty({ example: 'Salarios, infraestructura, marketing' })
  @IsString()
  costosPrincipales: string;

  @ApiProperty({ example: 'Mixta: salarios fijos + cloud variable' })
  @IsString()
  costosFijosVsVariables: string;

  @ApiProperty({ example: 'Sí, a partir de 1000 clientes' })
  @IsString()
  economiaDeEscala: string;
}

export class BmcBlocksDto {
  @ApiProperty({ type: BmcPropuestaDeValorDto })
  @IsObject()
  @ValidateNested()
  @Type(() => BmcPropuestaDeValorDto)
  propuestaDeValor: BmcPropuestaDeValorDto;

  @ApiProperty({ type: BmcSegmentosDeClientesDto })
  @IsObject()
  @ValidateNested()
  @Type(() => BmcSegmentosDeClientesDto)
  segmentosDeClientes: BmcSegmentosDeClientesDto;

  @ApiProperty({ type: BmcCanalesDto })
  @IsObject()
  @ValidateNested()
  @Type(() => BmcCanalesDto)
  canales: BmcCanalesDto;

  @ApiProperty({ type: BmcRelacionesConClientesDto })
  @IsObject()
  @ValidateNested()
  @Type(() => BmcRelacionesConClientesDto)
  relacionesConClientes: BmcRelacionesConClientesDto;

  @ApiProperty({ type: BmcFuentesDeIngresoDto })
  @IsObject()
  @ValidateNested()
  @Type(() => BmcFuentesDeIngresoDto)
  fuentesDeIngreso: BmcFuentesDeIngresoDto;

  @ApiProperty({ type: BmcRecursosClavesDto })
  @IsObject()
  @ValidateNested()
  @Type(() => BmcRecursosClavesDto)
  recursosClaves: BmcRecursosClavesDto;

  @ApiProperty({ type: BmcActividadesClavesDto })
  @IsObject()
  @ValidateNested()
  @Type(() => BmcActividadesClavesDto)
  actividadesClaves: BmcActividadesClavesDto;

  @ApiProperty({ type: BmcAsociacionesClavesDto })
  @IsObject()
  @ValidateNested()
  @Type(() => BmcAsociacionesClavesDto)
  asociacionesClaves: BmcAsociacionesClavesDto;

  @ApiProperty({ type: BmcEstructuraDeCostosDto })
  @IsObject()
  @ValidateNested()
  @Type(() => BmcEstructuraDeCostosDto)
  estructuraDeCostos: BmcEstructuraDeCostosDto;
}

export class BmcAnalyzeReqDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  toolApplicationId: number;

  @ApiProperty({ type: BmcBlocksDto })
  @IsObject()
  @ValidateNested()
  @Type(() => BmcBlocksDto)
  blocks: BmcBlocksDto;

  @ApiProperty({ example: 0, description: 'Cantidad de informes ya existentes (para calcular versión)' })
  @IsInt()
  @Min(0)
  currentVersion: number;
}
