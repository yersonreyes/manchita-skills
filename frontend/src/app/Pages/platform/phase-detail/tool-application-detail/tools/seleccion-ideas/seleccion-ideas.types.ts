export type IdeaEstadoSeleccion = 'pendiente' | 'seleccionada' | 'backlog' | 'descartada';

export interface CriterioSeleccionDto {
  id: string;
  nombre: string;
  peso: number;
}

export interface PuntuacionDto {
  criterioId: string;
  valor: number;
}

export interface IdeaSeleccionDto {
  id: string;
  texto: string;
  puntuaciones: PuntuacionDto[];
  estado: IdeaEstadoSeleccion;
  siguientePaso: string;
}

export interface SeleccionIdeasData {
  contexto: string;
  metodo: string;
  criterios: CriterioSeleccionDto[];
  ideas: IdeaSeleccionDto[];
  decision: string;
}

export const EMPTY_SELECCION_IDEAS: SeleccionIdeasData = {
  contexto: '',
  metodo: '',
  criterios: [],
  ideas: [],
  decision: '',
};

export const METODOS_SELECCION = [
  { value: 'scorecard', label: 'Scorecard (puntuación ponderada)' },
  { value: 'dot-voting', label: 'Dot Voting' },
  { value: 'impact-effort', label: 'Matriz Impacto-Esfuerzo' },
  { value: 'pareto', label: 'Principio de Pareto' },
  { value: 'votacion-simple', label: 'Votación simple' },
];

export interface AnalisisIdeaDto {
  idea: string;
  scoreTotal: number;
  puntosFuertes: string[];
  puntosDebiles: string[];
  recomendacion: string;
}

export interface SeleccionIdeasReportDto {
  executiveSummary: string;
  analisisIdeasSeleccionadas: AnalisisIdeaDto[];
  patronesDecision: string[];
  ideasRescatables: string[];
  alertasDeEquipo: string[];
  recommendations: string[];
}

export interface SeleccionIdeasReportVersionDto {
  version: number;
  generatedAt: string;
  report: SeleccionIdeasReportDto;
}

export interface SeleccionIdeasAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: SeleccionIdeasReportDto;
}
