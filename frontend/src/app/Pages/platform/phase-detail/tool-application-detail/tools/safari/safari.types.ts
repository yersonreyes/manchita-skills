// ─── Data types ───────────────────────────────────────────────────────────────

export interface ObservacionDto {
  id: string;
  momento: string;
  observacion: string;
  insight: string;
}

export interface SesionSafariDto {
  id: string;
  ubicacion: string;
  duracion: string;
  equipo: string;
  observaciones: ObservacionDto[];
  notas: string;
}

export interface SafariData {
  objetivo: string;
  guiaObservacion: string;
  sesiones: SesionSafariDto[];
  sintesis: string;
}

export const EMPTY_OBSERVACION = (): ObservacionDto => ({
  id: crypto.randomUUID(),
  momento: '',
  observacion: '',
  insight: '',
});

export const EMPTY_SESION = (): SesionSafariDto => ({
  id: crypto.randomUUID(),
  ubicacion: '',
  duracion: '',
  equipo: '',
  observaciones: [],
  notas: '',
});

export const EMPTY_SAFARI: SafariData = {
  objetivo: '',
  guiaObservacion: '',
  sesiones: [],
  sintesis: '',
};

// ─── Report types ─────────────────────────────────────────────────────────────

export interface ObservacionDestacadaDto {
  sesion: string;
  momento: string;
  observacion: string;
  insight: string;
}

export interface SafariReportDto {
  executiveSummary: string;
  observacionesDestacadas: ObservacionDestacadaDto[];
  patronesComportamiento: string[];
  workaroundsEncontrados: string[];
  painPointsCriticos: string[];
  momentosWow: string[];
  oportunidades: string[];
  recommendations: string[];
}

export interface SafariReportVersionDto {
  version: number;
  generatedAt: string;
  report: SafariReportDto;
}

export interface SafariAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: SafariReportDto;
}
