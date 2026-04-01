// ─── Data types ───────────────────────────────────────────────────────────────

export interface EntrevistaExpertoRespuesta {
  id: string;
  pregunta: string;
  respuesta: string;
}

export interface EntrevistaExpertoData {
  experto: string;
  experticia: string;
  organizacion: string;
  cargo: string;
  fecha: string;
  objetivos: string;
  respuestas: EntrevistaExpertoRespuesta[];
  citasTecnicas: string[];
  observaciones: string;
}

export const EMPTY_ENTREVISTA_EXPERTO: EntrevistaExpertoData = {
  experto: '',
  experticia: '',
  organizacion: '',
  cargo: '',
  fecha: '',
  objetivos: '',
  respuestas: [],
  citasTecnicas: [],
  observaciones: '',
};

// ─── Report types ─────────────────────────────────────────────────────────────

export interface EntrevistaExpertoInsight {
  categoria: string;
  insight: string;
  evidencia: string;
}

export interface EntrevistaExpertoReportDto {
  executiveSummary: string;
  perfilExperto: string;
  insights: EntrevistaExpertoInsight[];
  tendenciasClave: string[];
  barrerasYDesafios: string[];
  oportunidadesIdentificadas: string[];
  citasExperto: string[];
  recommendations: string[];
}

export interface EntrevistaExpertoReportVersionDto {
  version: number;
  generatedAt: string;
  report: EntrevistaExpertoReportDto;
}

export interface EntrevistaExpertoAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: EntrevistaExpertoReportDto;
}
