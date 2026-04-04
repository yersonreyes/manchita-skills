export type CuadranteFeedback = 'reforzar' | 'arreglar' | 'insights' | 'evaluar';
export type FuenteFeedback = 'testing' | 'entrevista' | 'analytics' | 'stakeholder' | 'soporte' | 'otro';
export type PrioridadFeedback = 'urgente' | 'normal' | 'baja';

export interface CuadranteConfig {
  label: string;
  emoji: string;
  color: string;
  bg: string;
  border: string;
  descripcion: string;
}

export const CUADRANTE_CONFIG: Record<CuadranteFeedback, CuadranteConfig> = {
  reforzar: { label: 'Reforzar',          emoji: '✅', color: '#065f46', bg: '#f0fdf4', border: '#86efac', descripcion: 'Sobre la solución · Positivo' },
  arreglar:  { label: 'Arreglar',         emoji: '⚠️', color: '#92400e', bg: '#fffbeb', border: '#fde68a', descripcion: 'Sobre la solución · Negativo' },
  insights:  { label: 'Nuevos Insights',  emoji: '💡', color: '#1e40af', bg: '#eff6ff', border: '#bfdbfe', descripcion: 'Sobre el problema · Positivo' },
  evaluar:   { label: 'Evaluar / Ignorar',emoji: '❌', color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb', descripcion: 'Sobre el problema · Negativo' },
};

export const FUENTE_OPTIONS: { value: FuenteFeedback; label: string }[] = [
  { value: 'testing',      label: 'Testing de usabilidad' },
  { value: 'entrevista',   label: 'Entrevista de usuario' },
  { value: 'analytics',    label: 'Analytics / métricas' },
  { value: 'stakeholder',  label: 'Revisión de stakeholders' },
  { value: 'soporte',      label: 'Feedback de soporte' },
  { value: 'otro',         label: 'Otro' },
];

export const PRIORIDAD_OPTIONS: { value: PrioridadFeedback; label: string; color: string }[] = [
  { value: 'urgente', label: 'Urgente', color: '#dc2626' },
  { value: 'normal',  label: 'Normal',  color: '#d97706' },
  { value: 'baja',    label: 'Baja',    color: '#9ca3af' },
];

export interface FeedbackItemDto {
  id: string;
  texto: string;
  fuente: FuenteFeedback;
  prioridad: PrioridadFeedback;
}

export interface MatrizFeedbackData {
  contexto: string;
  reforzar: FeedbackItemDto[];
  arreglar: FeedbackItemDto[];
  insights: FeedbackItemDto[];
  evaluar: FeedbackItemDto[];
}

export const EMPTY_MATRIZ_FEEDBACK: MatrizFeedbackData = {
  contexto: '',
  reforzar: [],
  arreglar: [],
  insights: [],
  evaluar: [],
};

export interface MatrizFeedbackReportDto {
  executiveSummary: string;
  patronesIdentificados: string;
  prioridadAcciones: string[];
  insightsDestacados: string[];
  feedbackAIgnorar: string;
  recommendations: string[];
}

export interface MatrizFeedbackReportVersionDto {
  version: number;
  generatedAt: string;
  report: MatrizFeedbackReportDto;
}
