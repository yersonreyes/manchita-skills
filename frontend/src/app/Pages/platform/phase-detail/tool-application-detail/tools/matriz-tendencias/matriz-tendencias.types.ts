export type TendenciaImpacto = 'alto' | 'bajo';
export type TendenciaPlazo = 'corto' | 'largo';
export type TendenciaCategoria = 'tecnologica' | 'social' | 'economica' | 'regulatoria' | 'mercado';

export const CATEGORIA_LABELS: Record<TendenciaCategoria, string> = {
  tecnologica: 'Tecnológica',
  social: 'Social',
  economica: 'Económica',
  regulatoria: 'Regulatoria',
  mercado: 'Mercado',
};

export const CATEGORIA_COLORS: Record<TendenciaCategoria, string> = {
  tecnologica: '#3b82f6',
  social: '#10b981',
  economica: '#f59e0b',
  regulatoria: '#ef4444',
  mercado: '#8b5cf6',
};

export interface TendenciaDto {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: TendenciaCategoria;
  impacto: TendenciaImpacto;
  plazo: TendenciaPlazo;
}

export interface CuadranteConfig {
  impacto: TendenciaImpacto;
  plazo: TendenciaPlazo;
  label: string;
  sublabel: string;
  icon: string;
  accentBg: string;
  borderColor: string;
  textColor: string;
  accentColor: string;
}

export const MATRIZ_CUADRANTES: CuadranteConfig[] = [
  {
    impacto: 'alto',
    plazo: 'corto',
    label: 'AHORA',
    sublabel: 'Alto impacto · Corto plazo',
    icon: 'pi-bolt',
    accentBg: '#fffbeb',
    borderColor: '#fde68a',
    textColor: '#92400e',
    accentColor: '#d97706',
  },
  {
    impacto: 'alto',
    plazo: 'largo',
    label: 'FUTURO',
    sublabel: 'Alto impacto · Largo plazo',
    icon: 'pi-arrow-up-right',
    accentBg: '#eff6ff',
    borderColor: '#bfdbfe',
    textColor: '#1e40af',
    accentColor: '#3b82f6',
  },
  {
    impacto: 'bajo',
    plazo: 'corto',
    label: 'IGNORAR',
    sublabel: 'Bajo impacto · Corto plazo',
    icon: 'pi-times-circle',
    accentBg: '#f9fafb',
    borderColor: '#e5e7eb',
    textColor: '#6b7280',
    accentColor: '#9ca3af',
  },
  {
    impacto: 'bajo',
    plazo: 'largo',
    label: 'MONITOREAR',
    sublabel: 'Bajo impacto · Largo plazo',
    icon: 'pi-eye',
    accentBg: '#f0fdf4',
    borderColor: '#a7f3d0',
    textColor: '#065f46',
    accentColor: '#10b981',
  },
];

export interface MatrizTendenciasData {
  contexto: string;
  tendencias: TendenciaDto[];
}

export const EMPTY_MATRIZ_TENDENCIAS: MatrizTendenciasData = {
  contexto: '',
  tendencias: [],
};

// ─── Report types ─────────────────────────────────────────────────────────────

export interface AnalisisCuadranteDto {
  cuadrante: string;
  tendencias: string[];
  estrategia: string;
}

export interface MatrizTendenciasReportDto {
  executiveSummary: string;
  analisisPorCuadrante: AnalisisCuadranteDto[];
  tendenciasClaves: string[];
  insightsEstrategicos: string[];
  riesgosIdentificados: string[];
  oportunidades: string[];
  recommendations: string[];
}

export interface MatrizTendenciasReportVersionDto {
  version: number;
  generatedAt: string;
  report: MatrizTendenciasReportDto;
}

export interface MatrizTendenciasAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: MatrizTendenciasReportDto;
}
