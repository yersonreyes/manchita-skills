// ─── Item types ───────────────────────────────────────────────────────────────

export interface AnalogoItem {
  industria: string;
  solucion: string;
  adaptacion: string;
}

export interface AntilogoItem {
  industria: string;
  fracaso: string;
  errorAEvitar: string;
}

export interface AnalogosAntilogosItems {
  analogos: AnalogoItem[];
  antilogos: AntilogoItem[];
}

export const EMPTY_ITEMS: AnalogosAntilogosItems = {
  analogos: [],
  antilogos: [],
};

// ─── Report types ─────────────────────────────────────────────────────────────

export interface AnalogoInsight {
  industria: string;
  principio: string;
  potencial: string;
}

export interface AntilogoLesson {
  industria: string;
  leccion: string;
  safeguard: string;
}

export interface AnalogosAntilogosReportDto {
  executiveSummary: string;
  analogoInsights: AnalogoInsight[];
  antilogoLessons: AntilogoLesson[];
  synthesisPrinciples: string[];
  recommendations: string[];
}

export interface AnalogosAntilogosReportVersionDto {
  version: number;
  generatedAt: string;
  report: AnalogosAntilogosReportDto;
}

export interface AnalogosAntilogosAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: AnalogosAntilogosReportDto;
}
