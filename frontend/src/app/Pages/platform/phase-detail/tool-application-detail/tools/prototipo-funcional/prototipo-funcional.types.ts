export type TipoPrototipoFuncional = 'mvp' | 'pilot' | 'beta' | 'feature-flag';
export type EstadoFlujo = 'pendiente' | 'funcionando' | 'con-bugs';
export type PrioridadFeature = 'alta' | 'media' | 'baja';
export type TipoHallazgo = 'funcional' | 'ux' | 'performance';

export const TIPOS_PROTOTIPO: { value: TipoPrototipoFuncional; label: string; descripcion: string }[] = [
  { value: 'mvp', label: 'MVP', descripcion: 'Producto mínimo viable para lanzamiento inicial' },
  { value: 'pilot', label: 'Pilot', descripcion: 'Versión limitada para testing en producción' },
  { value: 'beta', label: 'Beta', descripcion: 'Almost production para validación amplia' },
  { value: 'feature-flag', label: 'Feature Flag', descripcion: 'Funcionalidad toggled para testing gradual' },
];

export interface FlujoCriticoDto {
  id: string;
  nombre: string;
  descripcion: string;
  estado: EstadoFlujo;
}

export interface FeatureDto {
  id: string;
  nombre: string;
  prioridad: PrioridadFeature;
  incluida: boolean;
  notas: string;
}

export interface HallazgoDto {
  id: string;
  tipo: TipoHallazgo;
  descripcion: string;
  resuelto: boolean;
}

export interface PrototipoFuncionalData {
  objetivo: string;
  tipo: TipoPrototipoFuncional | '';
  herramientas: string[];
  flujosCriticos: FlujoCriticoDto[];
  features: FeatureDto[];
  hallazgos: HallazgoDto[];
  proximosPasos: string[];
}

export const EMPTY_PROTOTIPO_FUNCIONAL: PrototipoFuncionalData = {
  objetivo: '',
  tipo: '',
  herramientas: [],
  flujosCriticos: [],
  features: [],
  hallazgos: [],
  proximosPasos: [],
};

// ─── Report ──────────────────────────────────────────────────────────────────

export interface PrototipoFuncionalReportDto {
  executiveSummary: string;
  validacionTecnica: string;
  hallazgosCriticos: string[];
  hallazgosUX: string[];
  estadoFlujos: string;
  nivelConfianza: string;
  recommendations: string[];
}

export interface PrototipoFuncionalReportVersionDto {
  version: number;
  generatedAt: string;
  report: PrototipoFuncionalReportDto;
}
