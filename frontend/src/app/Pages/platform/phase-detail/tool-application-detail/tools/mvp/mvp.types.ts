export type TipoMvp = 'wizard-of-oz' | 'concierge' | 'landing-email' | 'crowdfunding' | 'feature-mvp';
export type ValorEsfuerzo = 'alto' | 'bajo';
export type CategoriaFeature = 'mvp' | 'later' | 'drop' | 'mandatory';

export const TIPOS_MVP: { value: TipoMvp; label: string; descripcion: string }[] = [
  { value: 'wizard-of-oz', label: 'Wizard of Oz', descripcion: 'Humanos simulan el sistema automáticamente' },
  { value: 'concierge', label: 'Concierge', descripcion: 'Servicio manual antes de automatizar' },
  { value: 'landing-email', label: 'Landing + Email', descripcion: 'Solo landing para validar interés' },
  { value: 'crowdfunding', label: 'Crowdfunding', descripcion: 'Video prototipo para validar demanda' },
  { value: 'feature-mvp', label: 'Feature MVP', descripcion: 'Solo el core feature que resuelve el problema' },
];

export interface FeatureMvpDto {
  id: string;
  nombre: string;
  valorUsuario: ValorEsfuerzo;
  esfuerzo: ValorEsfuerzo;
  incluida: boolean;
}

export function calcularCategoria(f: FeatureMvpDto): CategoriaFeature {
  if (f.valorUsuario === 'alto' && f.esfuerzo === 'bajo') return 'mvp';
  if (f.valorUsuario === 'alto' && f.esfuerzo === 'alto') return 'later';
  if (f.valorUsuario === 'bajo' && f.esfuerzo === 'bajo') return 'mandatory';
  return 'drop';
}

export const CATEGORIA_CONFIG: Record<CategoriaFeature, { label: string; color: string; bg: string; border: string }> = {
  mvp:       { label: 'MVP ✓',      color: '#15803d', bg: '#f0fdf4', border: '#86efac' },
  later:     { label: 'Later',      color: '#b45309', bg: '#fffbeb', border: '#fcd34d' },
  mandatory: { label: 'Mandatory',  color: '#0369a1', bg: '#e0f2fe', border: '#7dd3fc' },
  drop:      { label: 'Drop',       color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
};

export interface AprendizajeDto {
  id: string;
  hipotesis: string;
  metrica: string;
  resultado: string;
  validada: boolean | null;
}

export interface MvpData {
  hipotesisPrincipal: string;
  tipo: TipoMvp | '';
  coreFeature: string;
  features: FeatureMvpDto[];
  criteriosLanzamiento: string[];
  metricas: string[];
  aprendizajes: AprendizajeDto[];
}

export const EMPTY_MVP: MvpData = {
  hipotesisPrincipal: '',
  tipo: '',
  coreFeature: '',
  features: [],
  criteriosLanzamiento: [],
  metricas: [],
  aprendizajes: [],
};

// ─── Report ──────────────────────────────────────────────────────────────────

export interface MvpReportDto {
  executiveSummary: string;
  validezHipotesis: string;
  evaluacionScope: string;
  calidadMetricas: string;
  estadoValidacion: string;
  recommendations: string[];
}

export interface MvpReportVersionDto {
  version: number;
  generatedAt: string;
  report: MvpReportDto;
}
