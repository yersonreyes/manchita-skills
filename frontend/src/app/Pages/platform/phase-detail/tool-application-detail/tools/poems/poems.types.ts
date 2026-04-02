export type PoemsKey = 'people' | 'objects' | 'environment' | 'messages' | 'services';

export interface PoemsSectionConfig {
  key: PoemsKey;
  label: string;
  letter: string;
  icon: string;
  accentBg: string;
  borderColor: string;
  textColor: string;
  accentColor: string;
  placeholder: string;
}

export const POEMS_SECTIONS: PoemsSectionConfig[] = [
  {
    key: 'people',
    label: 'People',
    letter: 'P',
    icon: 'pi-users',
    accentBg: '#f5f3ff',
    borderColor: '#ddd6fe',
    textColor: '#6d28d9',
    accentColor: '#7c3aed',
    placeholder: 'Ej: Cajero que atiende de pie durante 8 horas...',
  },
  {
    key: 'objects',
    label: 'Objects',
    letter: 'O',
    icon: 'pi-box',
    accentBg: '#eff6ff',
    borderColor: '#bfdbfe',
    textColor: '#1d4ed8',
    accentColor: '#3b82f6',
    placeholder: 'Ej: Formulario en papel que se llena con lapicera...',
  },
  {
    key: 'environment',
    label: 'Environment',
    letter: 'E',
    icon: 'pi-map-marker',
    accentBg: '#f0fdf4',
    borderColor: '#a7f3d0',
    textColor: '#065f46',
    accentColor: '#10b981',
    placeholder: 'Ej: Local ruidoso con música alta que dificulta la comunicación...',
  },
  {
    key: 'messages',
    label: 'Messages',
    letter: 'M',
    icon: 'pi-comment',
    accentBg: '#fffbeb',
    borderColor: '#fde68a',
    textColor: '#b45309',
    accentColor: '#f59e0b',
    placeholder: 'Ej: Cartel "no se aceptan devoluciones" en letras pequeñas...',
  },
  {
    key: 'services',
    label: 'Services',
    letter: 'S',
    icon: 'pi-cog',
    accentBg: '#fff1f2',
    borderColor: '#fecdd3',
    textColor: '#be123c',
    accentColor: '#f43f5e',
    placeholder: 'Ej: Fila de espera sin señalización de tiempos estimados...',
  },
];

export interface PoemsData {
  contexto: string;
  sintesis: string;
  people: string[];
  objects: string[];
  environment: string[];
  messages: string[];
  services: string[];
}

export const EMPTY_POEMS: PoemsData = {
  contexto: '',
  sintesis: '',
  people: [],
  objects: [],
  environment: [],
  messages: [],
  services: [],
};

// ─── Report types ─────────────────────────────────────────────────────────────

export interface PoemsInsightDimensionDto {
  dimension: string;
  insight: string;
}

export interface PoemsReportDto {
  executiveSummary: string;
  insightsPorDimension: PoemsInsightDimensionDto[];
  patronesCross: string[];
  dimensionMasRica: string;
  tensionesYContradicciones: string[];
  oportunidades: string[];
  recommendations: string[];
}

export interface PoemsReportVersionDto {
  version: number;
  generatedAt: string;
  report: PoemsReportDto;
}

export interface PoemsAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: PoemsReportDto;
}
