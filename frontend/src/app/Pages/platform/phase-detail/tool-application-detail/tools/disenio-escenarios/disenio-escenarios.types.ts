export interface PasoFlujoDto {
  id: string;
  accion: string;
  reaccionSistema: string;
  emocion: string;
}

export interface EscenarioDto {
  id: string;
  nombre: string;
  tipo: string;
  // Contexto
  usuario: string;
  donde: string;
  cuando: string;
  objetivo: string;
  // Flujo
  pasos: PasoFlujoDto[];
  // Oportunidades
  oportunidades: string[];
}

export interface DisenioEscenariosData {
  contextoGeneral: string;
  escenarios: EscenarioDto[];
}

export const EMPTY_DISENIO_ESCENARIOS: DisenioEscenariosData = {
  contextoGeneral: '',
  escenarios: [],
};

export const TIPOS_ESCENARIO = [
  { value: 'happy-path', label: 'Happy Path', desc: 'Flujo ideal sin errores' },
  { value: 'edge-case', label: 'Edge Case', desc: 'Situaciones límite o inusuales' },
  { value: 'error', label: 'Error / Failure', desc: 'Qué pasa cuando algo falla' },
  { value: 'contextual', label: 'Contextual', desc: 'Situación específica (viaje, emergencia…)' },
  { value: 'day-in-life', label: 'Day in the Life', desc: 'Un día completo del usuario' },
];

export const TIPO_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'happy-path':   { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
  'edge-case':    { bg: '#fef9c3', text: '#713f12', border: '#fde047' },
  'error':        { bg: '#fee2e2', text: '#7f1d1d', border: '#fca5a5' },
  'contextual':   { bg: '#dbeafe', text: '#1e3a5f', border: '#93c5fd' },
  'day-in-life':  { bg: '#f5f3ff', text: '#3b0764', border: '#c4b5fd' },
};

export interface AnalisisEscenarioDto {
  nombre: string;
  tipo: string;
  momentosMagicos: string[];
  puntosDeFriccion: string[];
  emocionDominante: string;
}

export interface DisenioEscenariosReportDto {
  executiveSummary: string;
  analisisEscenarios: AnalisisEscenarioDto[];
  patronesEmocionales: string[];
  friccionesComunes: string[];
  oportunidadesDiseno: string[];
  recommendations: string[];
}

export interface DisenioEscenariosReportVersionDto {
  version: number;
  generatedAt: string;
  report: DisenioEscenariosReportDto;
}

export interface DisenioEscenariosAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: DisenioEscenariosReportDto;
}
