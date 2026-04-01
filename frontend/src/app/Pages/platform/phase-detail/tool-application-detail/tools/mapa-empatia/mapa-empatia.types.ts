export type MapaEmpatiaKey = 've' | 'oye' | 'piensa' | 'siente' | 'dice' | 'hace';

export interface MapaEmpatiaQuadrantConfig {
  key: MapaEmpatiaKey;
  label: string;
  icon: string;
  accentBg: string;
  borderColor: string;
  textColor: string;
  accentColor: string;
  placeholder: string;
}

export const MAPA_EMPATIA_QUADRANTS: MapaEmpatiaQuadrantConfig[] = [
  {
    key: 've',
    label: 'Ve',
    icon: 'pi-eye',
    accentBg: '#eff6ff',
    borderColor: '#bfdbfe',
    textColor: '#1d4ed8',
    accentColor: '#3b82f6',
    placeholder: 'Ej: Ve que sus competidores ofrecen planes más baratos...',
  },
  {
    key: 'oye',
    label: 'Oye',
    icon: 'pi-volume-up',
    accentBg: '#fdf4ff',
    borderColor: '#e9d5ff',
    textColor: '#7c3aed',
    accentColor: '#8b5cf6',
    placeholder: 'Ej: Escucha que "invertir es para gente con dinero"...',
  },
  {
    key: 'piensa',
    label: 'Piensa',
    icon: 'pi-lightbulb',
    accentBg: '#eef2ff',
    borderColor: '#c7d2fe',
    textColor: '#4338ca',
    accentColor: '#6366f1',
    placeholder: 'Ej: Piensa que no vale la pena pagar por features que no usa...',
  },
  {
    key: 'siente',
    label: 'Siente',
    icon: 'pi-heart',
    accentBg: '#fff1f2',
    borderColor: '#fecdd3',
    textColor: '#be123c',
    accentColor: '#f43f5e',
    placeholder: 'Ej: Siente frustración cuando el checkout toma mucho tiempo...',
  },
  {
    key: 'dice',
    label: 'Dice',
    icon: 'pi-comment',
    accentBg: '#fffbeb',
    borderColor: '#fde68a',
    textColor: '#b45309',
    accentColor: '#f59e0b',
    placeholder: 'Ej: Dice "solo quiero algo que funcione y ya"...',
  },
  {
    key: 'hace',
    label: 'Hace',
    icon: 'pi-bolt',
    accentBg: '#f0fdf4',
    borderColor: '#a7f3d0',
    textColor: '#065f46',
    accentColor: '#10b981',
    placeholder: 'Ej: Hace scroll rápidamente por las opciones sin leer...',
  },
];

export interface MapaEmpatiaData {
  usuario: string;
  contexto: string;
  ve: string[];
  oye: string[];
  piensa: string[];
  siente: string[];
  dice: string[];
  hace: string[];
}

export const EMPTY_MAPA_EMPATIA: MapaEmpatiaData = {
  usuario: '',
  contexto: '',
  ve: [],
  oye: [],
  piensa: [],
  siente: [],
  dice: [],
  hace: [],
};

// ─── Report types ─────────────────────────────────────────────────────────────

export interface MapaEmpatiaReportDto {
  executiveSummary: string;
  tensionesClaves: string[];
  insightsDeDiseno: string[];
  oportunidades: string[];
  recommendations: string[];
}

export interface MapaEmpatiaReportVersionDto {
  version: number;
  generatedAt: string;
  report: MapaEmpatiaReportDto;
}

export interface MapaEmpatiaAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: MapaEmpatiaReportDto;
}
