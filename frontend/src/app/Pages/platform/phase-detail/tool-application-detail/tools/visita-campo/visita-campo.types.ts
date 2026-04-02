// ─── Data types ───────────────────────────────────────────────────────────────

export type HallazgoTipo = 'observar' | 'preguntar' | 'experimentar' | 'documentar';

export interface HallazgoVisitaDto {
  id: string;
  tipo: HallazgoTipo;
  observacion: string;
  insight: string;
}

export interface VisitaDto {
  id: string;
  lugar: string;
  fecha: string;
  duracion: string;
  equipo: string;
  hallazgos: HallazgoVisitaDto[];
  notas: string;
}

export interface VisitaCampoData {
  objetivo: string;
  guiaVisita: string;
  visitas: VisitaDto[];
  sintesis: string;
}

export const HALLAZGO_TIPO_LABELS: Record<HallazgoTipo, string> = {
  observar: 'Observación',
  preguntar: 'Pregunta/Respuesta',
  experimentar: 'Experimentación',
  documentar: 'Documentación',
};

export const HALLAZGO_TIPO_ICONS: Record<HallazgoTipo, string> = {
  observar: 'pi-eye',
  preguntar: 'pi-comments',
  experimentar: 'pi-play',
  documentar: 'pi-camera',
};

export const HALLAZGO_TIPO_COLORS: Record<HallazgoTipo, string> = {
  observar: 'var(--p-teal-500)',
  preguntar: 'var(--p-blue-500)',
  experimentar: 'var(--p-violet-500)',
  documentar: 'var(--p-orange-500)',
};

export const EMPTY_HALLAZGO = (): HallazgoVisitaDto => ({
  id: crypto.randomUUID(),
  tipo: 'observar',
  observacion: '',
  insight: '',
});

export const EMPTY_VISITA = (): VisitaDto => ({
  id: crypto.randomUUID(),
  lugar: '',
  fecha: '',
  duracion: '',
  equipo: '',
  hallazgos: [],
  notas: '',
});

export const EMPTY_VISITA_CAMPO: VisitaCampoData = {
  objetivo: '',
  guiaVisita: '',
  visitas: [],
  sintesis: '',
};

// ─── Report types ─────────────────────────────────────────────────────────────

export interface HallazgoDestacadoDto {
  visita: string;
  tipo: string;
  observacion: string;
  insight: string;
}

export interface VisitaCampoReportDto {
  executiveSummary: string;
  hallazgosDestacados: HallazgoDestacadoDto[];
  patronesContextuales: string[];
  elementosInvisibles: string[];
  workaroundsEncontrados: string[];
  painPointsCriticos: string[];
  insightsDeContexto: string[];
  oportunidades: string[];
  recommendations: string[];
}

export interface VisitaCampoReportVersionDto {
  version: number;
  generatedAt: string;
  report: VisitaCampoReportDto;
}

export interface VisitaCampoAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: VisitaCampoReportDto;
}
