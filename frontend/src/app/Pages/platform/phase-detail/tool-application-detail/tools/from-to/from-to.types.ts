export interface TransformacionDto {
  id: string;
  from: string;
  to: string;
}

export interface FromToData {
  titulo: string;
  contextoActual: string;
  visionFuturo: string;
  transformaciones: TransformacionDto[];
}

export const EMPTY_FROM_TO: FromToData = {
  titulo: '',
  contextoActual: '',
  visionFuturo: '',
  transformaciones: [],
};

// ─── Report types ─────────────────────────────────────────────────────────────

export interface TransformacionAnalisisDto {
  from: string;
  to: string;
  brecha: string;
}

export interface FromToReportDto {
  executiveSummary: string;
  analisisFrom: string;
  analisisTo: string;
  transformacionesDestacadas: TransformacionAnalisisDto[];
  brechasCriticas: string[];
  insightsEstrategicos: string[];
  oportunidades: string[];
  recommendations: string[];
}

export interface FromToReportVersionDto {
  version: number;
  generatedAt: string;
  report: FromToReportDto;
}

export interface FromToAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: FromToReportDto;
}
