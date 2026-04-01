// ─── Data types ───────────────────────────────────────────────────────────────

export type BusquedaMediosTipo =
  | 'noticia'
  | 'blog'
  | 'podcast'
  | 'video'
  | 'red-social'
  | 'foro'
  | 'newsletter'
  | 'otro';

export interface BusquedaMediosHallazgo {
  id: string;
  tipo: BusquedaMediosTipo;
  titulo: string;
  fuente: string;
  insight: string;
}

export interface BusquedaMediosData {
  tema: string;
  queries: string[];
  hallazgos: BusquedaMediosHallazgo[];
  tendencias: string[];
  sentiment: string;
  narrativas: string[];
  gaps: string[];
}

export const EMPTY_BUSQUEDA_MEDIOS: BusquedaMediosData = {
  tema: '',
  queries: [],
  hallazgos: [],
  tendencias: [],
  sentiment: '',
  narrativas: [],
  gaps: [],
};

// ─── Tipo config ──────────────────────────────────────────────────────────────

export interface BusquedaMediosTipoConfig {
  value: BusquedaMediosTipo;
  label: string;
  icon: string;
  accentColor: string;
  accentBg: string;
}

export const BUSQUEDA_MEDIOS_TIPOS: BusquedaMediosTipoConfig[] = [
  { value: 'noticia', label: 'Noticia', icon: 'pi-file-edit', accentColor: '#3b82f6', accentBg: '#eff6ff' },
  { value: 'blog', label: 'Blog', icon: 'pi-pencil', accentColor: '#8b5cf6', accentBg: '#fdf4ff' },
  { value: 'podcast', label: 'Podcast', icon: 'pi-microphone', accentColor: '#ec4899', accentBg: '#fdf2f8' },
  { value: 'video', label: 'Video', icon: 'pi-video', accentColor: '#ef4444', accentBg: '#fef2f2' },
  { value: 'red-social', label: 'Red Social', icon: 'pi-share-alt', accentColor: '#f59e0b', accentBg: '#fffbeb' },
  { value: 'foro', label: 'Foro', icon: 'pi-comments', accentColor: '#10b981', accentBg: '#f0fdf4' },
  { value: 'newsletter', label: 'Newsletter', icon: 'pi-envelope', accentColor: '#6366f1', accentBg: '#eef2ff' },
  { value: 'otro', label: 'Otro', icon: 'pi-tag', accentColor: '#6b7280', accentBg: '#f9fafb' },
];

// ─── Synthesis field config ───────────────────────────────────────────────────

export interface SintesisFieldConfig {
  key: 'tendencias' | 'narrativas' | 'gaps';
  label: string;
  icon: string;
  placeholder: string;
  accentColor: string;
  accentBg: string;
  borderColor: string;
  textColor: string;
}

export const SINTESIS_FIELDS: SintesisFieldConfig[] = [
  {
    key: 'tendencias',
    label: 'Tendencias',
    icon: 'pi-arrow-up-right',
    placeholder: 'Ej: Crecimiento del 15% anual en el sector...',
    accentColor: '#0d9488',
    accentBg: '#f0fdfa',
    borderColor: '#99f6e4',
    textColor: '#0f766e',
  },
  {
    key: 'narrativas',
    label: 'Narrativas',
    icon: 'pi-megaphone',
    placeholder: 'Ej: "Lo natural es mejor" como narrativa dominante...',
    accentColor: '#8b5cf6',
    accentBg: '#fdf4ff',
    borderColor: '#e9d5ff',
    textColor: '#6d28d9',
  },
  {
    key: 'gaps',
    label: 'Gaps Identificados',
    icon: 'pi-exclamation-circle',
    placeholder: 'Ej: Falta de opciones accesibles en el mercado...',
    accentColor: '#f59e0b',
    accentBg: '#fffbeb',
    borderColor: '#fde68a',
    textColor: '#b45309',
  },
];

// ─── Report types ─────────────────────────────────────────────────────────────

export interface BusquedaMediosReportDto {
  executiveSummary: string;
  tendenciasClave: string[];
  sentimentGeneral: string;
  narrativasPredominantes: string[];
  gapsIdentificados: string[];
  implicacionesDeDiseno: string[];
  recommendations: string[];
}

export interface BusquedaMediosReportVersionDto {
  version: number;
  generatedAt: string;
  report: BusquedaMediosReportDto;
}

export interface BusquedaMediosAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: BusquedaMediosReportDto;
}
