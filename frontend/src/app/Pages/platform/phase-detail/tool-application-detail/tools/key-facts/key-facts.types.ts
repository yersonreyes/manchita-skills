export interface KeyFactDto {
  id: string;
  descripcion: string;
  fuente: string;
  implicacion: string;
}

export interface KeyFactsData {
  contexto: string;
  facts: KeyFactDto[];
}

export const EMPTY_KEY_FACTS: KeyFactsData = {
  contexto: '',
  facts: [],
};

export interface KeyFactsReportDto {
  executiveSummary: string;
  patronesIdentificados: string[];
  factsDestacados: string[];
  tensionesYContradicciones: string[];
  implicacionesEstrategicas: string[];
  oportunidadesDeDiseno: string[];
  recommendations: string[];
}

export interface KeyFactsReportVersionDto {
  version: number;
  generatedAt: string;
  report: KeyFactsReportDto;
}

export interface KeyFactsAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: KeyFactsReportDto;
}
