export interface TraslacionDto {
  id: string;
  dominioOrigen: string;
  fuenteTipo: string;
  mecanismo: string;
  como: string;
  traduccion: string;
}

export interface HibridacionTraslacionData {
  problema: string;
  contexto: string;
  traslaciones: TraslacionDto[];
  ideaResultante: string;
  mecanismoClave: string;
}

export const EMPTY_HIBRIDACION_TRASLACION: HibridacionTraslacionData = {
  problema: '',
  contexto: '',
  traslaciones: [],
  ideaResultante: '',
  mecanismoClave: '',
};

export const FUENTES_TRASLACION = [
  { value: 'industria-similar', label: 'Industria similar' },
  { value: 'industria-diferente', label: 'Industria diferente' },
  { value: 'naturaleza', label: 'Naturaleza / Biomímesis' },
  { value: 'vida-cotidiana', label: 'Vida cotidiana' },
  { value: 'tecnologia', label: 'Tecnología de otro campo' },
];

export interface AnalisisTraslacionDto {
  dominioOrigen: string;
  mecanismo: string;
  potencialDeTraslacion: string;
  desafiosAdaptacion: string[];
  impactoEsperado: string;
}

export interface HibridacionTraslacionReportDto {
  executiveSummary: string;
  evaluacionTraslacion: string;
  analisisTraslaciones: AnalisisTraslacionDto[];
  mecanismoClavePotenciado: string;
  riesgosContextuales: string[];
  diferenciacionCompetitiva: string;
  recommendations: string[];
}

export interface HibridacionTraslacionReportVersionDto {
  version: number;
  generatedAt: string;
  report: HibridacionTraslacionReportDto;
}

export interface HibridacionTraslacionAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: HibridacionTraslacionReportDto;
}
