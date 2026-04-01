// ─── Data types ───────────────────────────────────────────────────────────────

export interface FocusGroupPreguntaDto {
  id: string;
  fase: string; // 'icebreaker' | 'warm-up' | 'principal' | 'sintesis'
  pregunta: string;
  respuestasGrupales: string;
}

export interface FocusGroupData {
  objetivo: string;
  perfilParticipantes: string;
  cantidadParticipantes: string;
  ubicacion: string;
  fecha: string;
  preguntas: FocusGroupPreguntaDto[];
  dinamicasGrupales: string;
  citasClave: string[];
  observaciones: string;
}

export const EMPTY_FOCUS_GROUP: FocusGroupData = {
  objetivo: '',
  perfilParticipantes: '',
  cantidadParticipantes: '',
  ubicacion: '',
  fecha: '',
  preguntas: [],
  dinamicasGrupales: '',
  citasClave: [],
  observaciones: '',
};

// ─── Report types ─────────────────────────────────────────────────────────────

export interface FocusGroupInsightDto {
  categoria: string;
  insight: string;
  evidencia: string;
}

export interface FocusGroupReportDto {
  executiveSummary: string;
  patronesPrincipales: string[];
  insights: FocusGroupInsightDto[];
  consensos: string[];
  disensos: string[];
  citasDestacadas: string[];
  dinamicasObservadas: string;
  oportunidades: string[];
  recommendations: string[];
}

export interface FocusGroupReportVersionDto {
  version: number;
  generatedAt: string;
  report: FocusGroupReportDto;
}

export interface FocusGroupAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: FocusGroupReportDto;
}
