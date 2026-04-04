export type Impacto = 'alto' | 'bajo';
export type Incertidumbre = 'alta' | 'baja';
export type CuadranteHipotesis = 'priority' | 'later' | 'drop' | 'optional';

export function calcularCuadrante(impacto: Impacto, incertidumbre: Incertidumbre): CuadranteHipotesis {
  if (impacto === 'alto' && incertidumbre === 'alta') return 'priority';
  if (impacto === 'alto' && incertidumbre === 'baja') return 'later';
  if (impacto === 'bajo' && incertidumbre === 'alta') return 'drop';
  return 'optional';
}

export interface CuadranteConfig {
  label: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
}

export const CUADRANTE_CONFIG: Record<CuadranteHipotesis, CuadranteConfig> = {
  priority: { label: 'PRIORITY', icon: 'pi-trophy',       color: '#92400e', bg: '#fffbeb', border: '#fde68a' },
  later:    { label: 'LATER',    icon: 'pi-clock',         color: '#1e40af', bg: '#eff6ff', border: '#bfdbfe' },
  drop:     { label: 'DROP',     icon: 'pi-times-circle',  color: '#991b1b', bg: '#fef2f2', border: '#fecaca' },
  optional: { label: 'OPTIONAL', icon: 'pi-minus-circle',  color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
};

export interface HipotesisDto {
  id: string;
  formulacion: string;
  impacto: Impacto;
  incertidumbre: Incertidumbre;
  experimento: string;
}

export interface MatrizHipotesisData {
  contexto: string;
  hipotesis: HipotesisDto[];
}

export const EMPTY_MATRIZ_HIPOTESIS: MatrizHipotesisData = {
  contexto: '',
  hipotesis: [],
};

export interface MatrizHipotesisReportDto {
  executiveSummary: string;
  prioridadValidacion: string;
  hipotesisCriticas: string[];
  experimentosRecomendados: string[];
  riesgosIdentificados: string[];
  recommendations: string[];
}

export interface MatrizHipotesisReportVersionDto {
  version: number;
  generatedAt: string;
  report: MatrizHipotesisReportDto;
}
