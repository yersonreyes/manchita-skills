// ─── Data types ───────────────────────────────────────────────────────────────

export interface CjmEtapa {
  id: string;
  nombre: string;
  acciones: string[];
  emociones: string[];
  touchpoints: string[];
  painPoints: string[];
  oportunidades: string[];
}

export interface CustomerJourneyMapData {
  personaje: string;
  escenario: string;
  etapas: CjmEtapa[];
}

export const EMPTY_CJM_ETAPA = (): CjmEtapa => ({
  id: crypto.randomUUID(),
  nombre: '',
  acciones: [],
  emociones: [],
  touchpoints: [],
  painPoints: [],
  oportunidades: [],
});

export const EMPTY_CJM: CustomerJourneyMapData = {
  personaje: '',
  escenario: '',
  etapas: [],
};

// ─── Etapa fields config ───────────────────────────────────────────────────────

export interface CjmFieldConfig {
  key: keyof Omit<CjmEtapa, 'id' | 'nombre'>;
  label: string;
  icon: string;
  accentColor: string;
  accentBg: string;
  borderColor: string;
  textColor: string;
  placeholder: string;
}

export const CJM_FIELDS: CjmFieldConfig[] = [
  {
    key: 'acciones',
    label: 'Acciones',
    icon: 'pi-bolt',
    accentColor: '#3b82f6',
    accentBg: '#eff6ff',
    borderColor: '#bfdbfe',
    textColor: '#1d4ed8',
    placeholder: 'Ej: Busca información, compara opciones...',
  },
  {
    key: 'emociones',
    label: 'Emociones',
    icon: 'pi-heart',
    accentColor: '#f43f5e',
    accentBg: '#fff1f2',
    borderColor: '#fecdd3',
    textColor: '#be123c',
    placeholder: 'Ej: Curiosa, emocionada, frustrada...',
  },
  {
    key: 'touchpoints',
    label: 'Touchpoints',
    icon: 'pi-send',
    accentColor: '#8b5cf6',
    accentBg: '#fdf4ff',
    borderColor: '#e9d5ff',
    textColor: '#6d28d9',
    placeholder: 'Ej: App, email, soporte telefónico...',
  },
  {
    key: 'painPoints',
    label: 'Pain Points',
    icon: 'pi-exclamation-circle',
    accentColor: '#f97316',
    accentBg: '#fff7ed',
    borderColor: '#fed7aa',
    textColor: '#c2410c',
    placeholder: 'Ej: Proceso lento, precio confuso...',
  },
  {
    key: 'oportunidades',
    label: 'Oportunidades',
    icon: 'pi-arrow-up-right',
    accentColor: '#10b981',
    accentBg: '#f0fdf4',
    borderColor: '#a7f3d0',
    textColor: '#065f46',
    placeholder: 'Ej: Onboarding simplificado, trial gratis...',
  },
];

// ─── Report types ─────────────────────────────────────────────────────────────

export interface CjmEtapaAnalisis {
  etapa: string;
  emocionPredominante: string;
  nivelFriccion: 'bajo' | 'medio' | 'alto';
  insight: string;
}

export interface CustomerJourneyMapReportDto {
  executiveSummary: string;
  momentosDeLaVerdad: string[];
  etapasAnalisis: CjmEtapaAnalisis[];
  painPointsCriticos: string[];
  oportunidadesPriorizadas: string[];
  recommendations: string[];
}

export interface CustomerJourneyMapReportVersionDto {
  version: number;
  generatedAt: string;
  report: CustomerJourneyMapReportDto;
}

export interface CustomerJourneyMapAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: CustomerJourneyMapReportDto;
}
