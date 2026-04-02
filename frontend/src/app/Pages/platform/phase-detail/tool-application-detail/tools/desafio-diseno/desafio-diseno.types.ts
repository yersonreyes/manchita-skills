export interface DesafioItemDto {
  id: string;
  accion: string;
  usuario: string;
  contexto: string;
  resultado: string;
  constraints: string[];
  criteriosExito: string[];
}

export interface DesafioDisenoData {
  contexto: string;
  desafios: DesafioItemDto[];
}

export const EMPTY_DESAFIO_DISENO: DesafioDisenoData = {
  contexto: '',
  desafios: [],
};

export interface AnalisisDesafioDto {
  enunciado: string;
  fortaleza: string;
  riesgo: string;
  hmwDerivados: string[];
}

export interface DesafioDisenoReportDto {
  executiveSummary: string;
  analisisPorDesafio: AnalisisDesafioDto[];
  desafioMasCritico: string;
  constraintsClaves: string[];
  criteriosExitoSugeridos: string[];
  posiblesEnfoques: string[];
  recommendations: string[];
}

export interface DesafioDisenoReportVersionDto {
  version: number;
  generatedAt: string;
  report: DesafioDisenoReportDto;
}

export interface DesafioDisenoAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: DesafioDisenoReportDto;
}
