export type FidelidadPrototipo = 'low' | 'low-mid' | 'mid' | 'mid-hi' | 'high';
export type PropositoPrototipo = 'explorar' | 'validar' | 'comunicar' | 'refinar';
export type PrioridadFeature = 'alta' | 'media' | 'baja';

export const FIDELIDAD_CONFIG: Record<FidelidadPrototipo, { label: string; color: string; bg: string }> = {
  'low':    { label: 'Low-fi',    color: '#6b7280', bg: '#f3f4f6' },
  'low-mid':{ label: 'Low-mid',   color: '#b45309', bg: '#fffbeb' },
  'mid':    { label: 'Mid-fi',    color: '#0369a1', bg: '#e0f2fe' },
  'mid-hi': { label: 'Mid-high',  color: '#7c3aed', bg: '#f5f3ff' },
  'high':   { label: 'High-fi',   color: '#15803d', bg: '#f0fdf4' },
};

export const PROPOSITO_CONFIG: Record<PropositoPrototipo, { label: string; icon: string }> = {
  explorar:  { label: 'Explorar',  icon: 'pi-search' },
  validar:   { label: 'Validar',   icon: 'pi-check-circle' },
  comunicar: { label: 'Comunicar', icon: 'pi-users' },
  refinar:   { label: 'Refinar',   icon: 'pi-wrench' },
};

export interface PrototipoDto {
  id: string;
  nombre: string;
  fidelidad: FidelidadPrototipo;
  proposito: PropositoPrototipo;
  herramienta: string;
  entregable: string;
  completado: boolean;
}

export interface FaseDto {
  id: string;
  nombre: string;
  semanas: string;
  objetivo: string;
  prototipos: PrototipoDto[];
}

export interface FeaturePrioridadDto {
  id: string;
  nombre: string;
  prioridad: PrioridadFeature;
  fase: string;
  razon: string;
}

export interface RoadmapPrototipadoData {
  contexto: string;
  equipo: string;
  duracionTotal: string;
  restricciones: string[];
  fases: FaseDto[];
  features: FeaturePrioridadDto[];
}

export const EMPTY_ROADMAP_PROTOTIPADO: RoadmapPrototipadoData = {
  contexto: '',
  equipo: '',
  duracionTotal: '',
  restricciones: [],
  fases: [],
  features: [],
};

// ─── Report ──────────────────────────────────────────────────────────────────

export interface RoadmapPrototipadoReportDto {
  executiveSummary: string;
  evaluacionEstrategia: string;
  riesgosTimeline: string[];
  bottlenecks: string[];
  prioridadRecomendada: string;
  recommendations: string[];
}

export interface RoadmapPrototipadoReportVersionDto {
  version: number;
  generatedAt: string;
  report: RoadmapPrototipadoReportDto;
}
