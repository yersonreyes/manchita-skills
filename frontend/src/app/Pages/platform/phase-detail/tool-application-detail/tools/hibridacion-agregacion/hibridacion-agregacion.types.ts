export interface IdeaBaseDto {
  id: string;
  nombre: string;
  descripcion: string;
  elementos: string[];
}

export interface CombinacionDto {
  id: string;
  elementoA: string;
  elementoB: string;
  resultado: string;
}

export interface HibridacionAgregacionData {
  contexto: string;
  tecnica: string;
  ideasBase: IdeaBaseDto[];
  combinaciones: CombinacionDto[];
  ideaHibrida: string;
  propuestaValor: string;
}

export const EMPTY_HIBRIDACION_AGREGACION: HibridacionAgregacionData = {
  contexto: '',
  tecnica: '',
  ideasBase: [],
  combinaciones: [],
  ideaHibrida: '',
  propuestaValor: '',
};

export const TECNICAS_AGREGACION = [
  { value: 'feature-stacking', label: 'Feature Stacking (sumar features)' },
  { value: 'best-of-each', label: 'Best of Each (lo mejor de cada idea)' },
  { value: 'plus-minus', label: 'Plus/Minus (agregar y quitar elementos)' },
  { value: 'mashup', label: 'Mashup (combinar productos/servicios)' },
];

export interface AnalisisCombinacionDto {
  combinacion: string;
  sinergia: string;
  riesgo: string;
}

export interface HibridacionAgregacionReportDto {
  executiveSummary: string;
  evaluacionHibrida: string;
  elementosClave: string[];
  sinergiasDetectadas: AnalisisCombinacionDto[];
  riesgosIntegracion: string[];
  propuestaValorAmpliada: string;
  recommendations: string[];
}

export interface HibridacionAgregacionReportVersionDto {
  version: number;
  generatedAt: string;
  report: HibridacionAgregacionReportDto;
}

export interface HibridacionAgregacionAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: HibridacionAgregacionReportDto;
}
