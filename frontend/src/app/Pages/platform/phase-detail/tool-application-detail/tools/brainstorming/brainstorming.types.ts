export interface IdeaBrainstormingDto {
  id: string;
  texto: string;
  cluster: string;
  votos: number;
}

export interface BrainstormingData {
  reto: string;
  tecnica: string;
  participantes: string;
  ideas: IdeaBrainstormingDto[];
  topIdeas: string[];
  notas: string;
}

export const EMPTY_BRAINSTORMING: BrainstormingData = {
  reto: '',
  tecnica: '',
  participantes: '',
  ideas: [],
  topIdeas: [],
  notas: '',
};

export const TECNICAS_BRAINSTORMING = [
  { value: 'clasico', label: 'Clásico' },
  { value: 'worst-possible-idea', label: 'Worst Possible Idea' },
  { value: 'scamper', label: 'SCAMPER' },
  { value: 'brainwriting', label: 'Brainwriting' },
  { value: 'sketching', label: 'Sketching' },
];

export interface AnalisisTopIdeaDto {
  idea: string;
  potencial: string;
  riesgos: string;
  siguientesPasos: string;
}

export interface BrainstormingReportDto {
  executiveSummary: string;
  calidadSesion: string;
  analisisTopIdeas: AnalisisTopIdeaDto[];
  clustersDestacados: string[];
  ideasInnovadoras: string[];
  ideasAExplorar: string[];
  recommendations: string[];
}

export interface BrainstormingReportVersionDto {
  version: number;
  generatedAt: string;
  report: BrainstormingReportDto;
}

export interface BrainstormingAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: BrainstormingReportDto;
}
