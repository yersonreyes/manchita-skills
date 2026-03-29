export type FodaQuadrantKey = 'fortalezas' | 'oportunidades' | 'debilidades' | 'amenazas';

export interface FodaItems {
  fortalezas: string[];
  oportunidades: string[];
  debilidades: string[];
  amenazas: string[];
}

export const EMPTY_ITEMS: FodaItems = {
  fortalezas: [],
  oportunidades: [],
  debilidades: [],
  amenazas: [],
};

export interface FodaQuadrantConfig {
  key: FodaQuadrantKey;
  label: string;
  icon: string;
  colorClass: string;
  accentColor: string;
  accentBg: string;
  borderColor: string;
  textColor: string;
  placeholder: string;
}

export const FODA_QUADRANTS: FodaQuadrantConfig[] = [
  {
    key: 'fortalezas',
    label: 'Fortalezas',
    icon: 'pi-shield',
    colorClass: 'strengths',
    accentColor: '#22c55e',
    accentBg: '#f0fdf4',
    borderColor: '#bbf7d0',
    textColor: '#15803d',
    placeholder: 'Ej: Equipo experimentado...',
  },
  {
    key: 'oportunidades',
    label: 'Oportunidades',
    icon: 'pi-arrow-up-right',
    colorClass: 'opportunities',
    accentColor: '#3b82f6',
    accentBg: '#eff6ff',
    borderColor: '#bfdbfe',
    textColor: '#1d4ed8',
    placeholder: 'Ej: Mercado en crecimiento...',
  },
  {
    key: 'debilidades',
    label: 'Debilidades',
    icon: 'pi-times-circle',
    colorClass: 'weaknesses',
    accentColor: '#f97316',
    accentBg: '#fff7ed',
    borderColor: '#fed7aa',
    textColor: '#c2410c',
    placeholder: 'Ej: Falta de financiamiento...',
  },
  {
    key: 'amenazas',
    label: 'Amenazas',
    icon: 'pi-exclamation-triangle',
    colorClass: 'threats',
    accentColor: '#ef4444',
    accentBg: '#fef2f2',
    borderColor: '#fecaca',
    textColor: '#b91c1c',
    placeholder: 'Ej: Competencia agresiva...',
  },
];

// ─── Report types ─────────────────────────────────────────────────────────────

export interface FodaQuadrantAnalysis {
  observations: string[];
  suggestions: string[];
}

export interface FodaQuadrantRiskAnalysis {
  risks: string[];
  mitigations: string[];
}

export interface FodaReportDto {
  executiveSummary: string;
  quadrantAnalysis: {
    fortalezas: FodaQuadrantAnalysis;
    oportunidades: FodaQuadrantAnalysis;
    debilidades: FodaQuadrantRiskAnalysis;
    amenazas: FodaQuadrantRiskAnalysis;
  };
  strategicScore: number;
  keyOpportunities: string[];
  criticalThreats: string[];
  recommendations: string[];
}

export interface FodaReportVersionDto {
  version: number;
  generatedAt: string;
  report: FodaReportDto;
}

export interface FodaAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: FodaReportDto;
}
