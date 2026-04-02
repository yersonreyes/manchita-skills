export type IdeaEstado = 'activa' | 'seleccionada' | 'descartada';

export interface IdeaConvergenciaDto {
  id: string;
  texto: string;
  cluster: string;
  estado: IdeaEstado;
  razonDescarte: string;
}

export interface MapaConvergenciaData {
  contexto: string;
  criterios: string[];
  ideas: IdeaConvergenciaDto[];
  notas: string;
}

export const EMPTY_MAPA_CONVERGENCIA: MapaConvergenciaData = {
  contexto: '',
  criterios: [],
  ideas: [],
  notas: '',
};

export interface AnalisisIdeaSeleccionadaDto {
  idea: string;
  potencial: string;
  riesgos: string;
  nextSteps: string;
}

export interface MapaConvergenciaReportDto {
  executiveSummary: string;
  analisisIdeasSeleccionadas: AnalisisIdeaSeleccionadaDto[];
  patronesConvergencia: string[];
  ideasARevisitar: string[];
  alertasDeEquipo: string[];
  recommendations: string[];
}

export interface MapaConvergenciaReportVersionDto {
  version: number;
  generatedAt: string;
  report: MapaConvergenciaReportDto;
}

export interface MapaConvergenciaAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: MapaConvergenciaReportDto;
}
