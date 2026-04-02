export interface PovItemDto {
  id: string;
  usuario: string;
  necesidad: string;
  insight: string;
}

export interface PovData {
  contexto: string;
  povs: PovItemDto[];
}

export const EMPTY_POV: PovData = {
  contexto: '',
  povs: [],
};

export interface AnalisisPovDto {
  enunciado: string;
  fortaleza: string;
  oportunidadMejora: string;
  hmwSugeridos: string[];
}

export interface PovReportDto {
  executiveSummary: string;
  analisisPorPov: AnalisisPovDto[];
  povMasAccionable: string;
  hmwPrioritarios: string[];
  tensionesIdentificadas: string[];
  recommendations: string[];
}

export interface PovReportVersionDto {
  version: number;
  generatedAt: string;
  report: PovReportDto;
}

export interface PovAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: PovReportDto;
}
