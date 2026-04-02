// ─── Data types ───────────────────────────────────────────────────────────────

export type MetodoRemotoTipo =
  | 'encuesta'
  | 'entrevista-video'
  | 'diary-study'
  | 'testing'
  | 'card-sorting'
  | 'tree-testing'
  | 'otro';

export interface MetodoRemotoDto {
  id: string;
  tipo: MetodoRemotoTipo;
  objetivo: string;
  herramienta: string;
  participantes: string;
  hallazgos: string[];
  notas: string;
}

export interface InvestigacionRemotaData {
  objetivo: string;
  contexto: string;
  fechas: string;
  equipo: string;
  metodos: MetodoRemotoDto[];
  observaciones: string;
}

export const METODO_LABELS: Record<MetodoRemotoTipo, string> = {
  'encuesta': 'Encuesta Online',
  'entrevista-video': 'Entrevista por Video',
  'diary-study': 'Diary Study',
  'testing': 'Unmoderated Testing',
  'card-sorting': 'Card Sorting',
  'tree-testing': 'Tree Testing',
  'otro': 'Otro',
};

export const METODO_ICONS: Record<MetodoRemotoTipo, string> = {
  'encuesta': 'pi-list-check',
  'entrevista-video': 'pi-video',
  'diary-study': 'pi-calendar',
  'testing': 'pi-desktop',
  'card-sorting': 'pi-th-large',
  'tree-testing': 'pi-sitemap',
  'otro': 'pi-wrench',
};

export const EMPTY_METODO = (): MetodoRemotoDto => ({
  id: crypto.randomUUID(),
  tipo: 'encuesta',
  objetivo: '',
  herramienta: '',
  participantes: '',
  hallazgos: [],
  notas: '',
});

export const EMPTY_INVESTIGACION_REMOTA: InvestigacionRemotaData = {
  objetivo: '',
  contexto: '',
  fechas: '',
  equipo: '',
  metodos: [],
  observaciones: '',
};

// ─── Report types ─────────────────────────────────────────────────────────────

export interface HallazgoRemotoDto {
  metodo: string;
  hallazgo: string;
  implicancia: string;
}

export interface InvestigacionRemotaReportDto {
  executiveSummary: string;
  hallazgosClave: HallazgoRemotoDto[];
  patronesEncontrados: string[];
  insightsAccionables: string[];
  limitacionesDetectadas: string[];
  oportunidades: string[];
  recommendations: string[];
}

export interface InvestigacionRemotaReportVersionDto {
  version: number;
  generatedAt: string;
  report: InvestigacionRemotaReportDto;
}

export interface InvestigacionRemotaAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: InvestigacionRemotaReportDto;
}
