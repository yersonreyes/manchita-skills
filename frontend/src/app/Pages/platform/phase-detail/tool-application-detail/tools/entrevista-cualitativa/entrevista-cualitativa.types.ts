// ─── Data types ───────────────────────────────────────────────────────────────

export interface EntrevistaCualitativaRespuesta {
  id: string;
  pregunta: string;
  respuesta: string;
}

export interface EntrevistaCualitativaData {
  entrevistado: string;
  perfil: string;
  fecha: string;
  objetivos: string;
  respuestas: EntrevistaCualitativaRespuesta[];
  citasClave: string[];
  observaciones: string;
}

export const EMPTY_ENTREVISTA_CUALITATIVA: EntrevistaCualitativaData = {
  entrevistado: '',
  perfil: '',
  fecha: '',
  objetivos: '',
  respuestas: [],
  citasClave: [],
  observaciones: '',
};

// ─── Report types ─────────────────────────────────────────────────────────────

export interface EntrevistaCualitativaInsight {
  categoria: string;
  insight: string;
  evidencia: string;
}

export interface EntrevistaCualitativaReportDto {
  executiveSummary: string;
  perfilEntrevistado: string;
  insights: EntrevistaCualitativaInsight[];
  necesidadesDetectadas: string[];
  painPoints: string[];
  motivaciones: string[];
  citasDestacadas: string[];
  recommendations: string[];
}

export interface EntrevistaCualitativaReportVersionDto {
  version: number;
  generatedAt: string;
  report: EntrevistaCualitativaReportDto;
}

export interface EntrevistaCualitativaAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: EntrevistaCualitativaReportDto;
}
