export interface MetaforaItemDto {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: string;
  insights: string[];
}

export interface MetaforaProblemaData {
  problemaOriginal: string;
  metaforas: MetaforaItemDto[];
  metaforaSeleccionada: string;
}

export const EMPTY_METAFORA_PROBLEMA: MetaforaProblemaData = {
  problemaOriginal: '',
  metaforas: [],
  metaforaSeleccionada: '',
};

export interface AnalisisMetaforaDto {
  titulo: string;
  fertilidad: string;
  insightsDerivados: string[];
  limitaciones: string;
  aplicacionesPotenciales: string[];
}

export interface MetaforaProblemaReportDto {
  executiveSummary: string;
  analisisPorMetafora: AnalisisMetaforaDto[];
  metaforaRecomendada: string;
  insightsClave: string[];
  implicacionesDeDiseno: string[];
  recommendations: string[];
}

export interface MetaforaProblemaReportVersionDto {
  version: number;
  generatedAt: string;
  report: MetaforaProblemaReportDto;
}

export interface MetaforaProblemaAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: MetaforaProblemaReportDto;
}
