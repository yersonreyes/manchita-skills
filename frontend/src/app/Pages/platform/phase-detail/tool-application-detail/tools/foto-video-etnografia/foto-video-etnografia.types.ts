// ─── Data types ───────────────────────────────────────────────────────────────

export interface FotoVideoRegistroDto {
  id: string;
  tipo: 'foto' | 'video';
  titulo: string;
  url: string;
  lugar: string;
  sujeto: string;
  observacion: string;
  insight: string;
}

export interface FotoVideoEtnografiaData {
  objetivo: string;
  contexto: string;
  fechasSalida: string;
  equipo: string;
  registros: FotoVideoRegistroDto[];
  patronesVisuales: string;
  citasVisuales: string[];
  observaciones: string;
}

export const EMPTY_FOTO_VIDEO_ETNOGRAFIA: FotoVideoEtnografiaData = {
  objetivo: '',
  contexto: '',
  fechasSalida: '',
  equipo: '',
  registros: [],
  patronesVisuales: '',
  citasVisuales: [],
  observaciones: '',
};

// ─── Report types ─────────────────────────────────────────────────────────────

export interface FotoVideoInsightDto {
  categoria: string;
  insight: string;
  evidencia: string;
}

export interface FotoVideoEtnografiaReportDto {
  executiveSummary: string;
  patronesPrincipales: string[];
  insights: FotoVideoInsightDto[];
  contextoUsuario: string;
  workaroundsDetectados: string[];
  citasVisualesDestacadas: string[];
  oportunidades: string[];
  recommendations: string[];
}

export interface FotoVideoEtnografiaReportVersionDto {
  version: number;
  generatedAt: string;
  report: FotoVideoEtnografiaReportDto;
}

export interface FotoVideoEtnografiaAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: FotoVideoEtnografiaReportDto;
}
