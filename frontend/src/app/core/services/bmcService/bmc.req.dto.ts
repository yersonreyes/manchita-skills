export interface BmcPropuestaDeValorDto {
  problemasQueResuelve: string;
  beneficiosClave: string;
  productoServicio: string;
}

export interface BmcSegmentosDeClientesDto {
  clientePrincipal: string;
  caracteristicas: string;
  necesidadQueResuelves: string;
}

export interface BmcCanalesDto {
  comoLlegasAlCliente: string;
  etapaDelFunnel: string;
  costoEficiencia: string;
}

export interface BmcRelacionesConClientesDto {
  tipoDeRelacion: string;
  adquisicion: string;
  retencion: string;
}

export interface BmcFuentesDeIngresoDto {
  comoGenerasIngresos: string;
  modeloDePrecio: string;
  disposicionAPagar: string;
}

export interface BmcRecursosClavesDto {
  recursosNecesarios: string;
  tipoDeRecurso: string;
  masCritico: string;
}

export interface BmcActividadesClavesDto {
  actividadesPrincipales: string;
  produccionVsServicio: string;
  diferenciadoras: string;
}

export interface BmcAsociacionesClavesDto {
  sociosPrincipales: string;
  queTercerizan: string;
  motivacion: string;
}

export interface BmcEstructuraDeCostosDto {
  costosPrincipales: string;
  costosFijosVsVariables: string;
  economiaDeEscala: string;
}

export interface BmcBlocksDto {
  propuestaDeValor: BmcPropuestaDeValorDto;
  segmentosDeClientes: BmcSegmentosDeClientesDto;
  canales: BmcCanalesDto;
  relacionesConClientes: BmcRelacionesConClientesDto;
  fuentesDeIngreso: BmcFuentesDeIngresoDto;
  recursosClaves: BmcRecursosClavesDto;
  actividadesClaves: BmcActividadesClavesDto;
  asociacionesClaves: BmcAsociacionesClavesDto;
  estructuraDeCostos: BmcEstructuraDeCostosDto;
}

export interface BmcAnalyzeReqDto {
  toolApplicationId: number;
  blocks: BmcBlocksDto;
  currentVersion: number;
}
