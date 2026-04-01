// ─── Data types ───────────────────────────────────────────────────────────────

export interface BenchmarkingCriterio {
  id: string;
  nombre: string;
}

export interface BenchmarkingCompetidor {
  id: string;
  nombre: string;
  valores: Record<string, string>; // criterioId → valor
}

export interface BenchmarkingData {
  contexto: string;      // qué estamos comparando, ej: "Apps de inversión para fintechs"
  miProducto: string;    // nombre de tu producto
  miValores: Record<string, string>; // criterioId → valor de tu producto
  criterios: BenchmarkingCriterio[];
  competidores: BenchmarkingCompetidor[];
}

export const EMPTY_BENCHMARKING: BenchmarkingData = {
  contexto: '',
  miProducto: '',
  miValores: {},
  criterios: [],
  competidores: [],
};

// ─── Report types ─────────────────────────────────────────────────────────────

export interface BenchmarkingBrechaDto {
  criterio: string;
  estado: 'ventaja' | 'paridad' | 'brecha';
  observacion: string;
}

export interface BenchmarkingReportDto {
  executiveSummary: string;
  posicionamiento: string;
  brechas: BenchmarkingBrechaDto[];
  ventajasCompetitivas: string[];
  amenazas: string[];
  oportunidadesDeDiferenciacion: string[];
  recommendations: string[];
}

export interface BenchmarkingReportVersionDto {
  version: number;
  generatedAt: string;
  report: BenchmarkingReportDto;
}

export interface BenchmarkingAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: BenchmarkingReportDto;
}
