// ─── Data types ───────────────────────────────────────────────────────────────

export type MetodoTest = 'encuesta' | 'analytics' | 'ab-testing' | 'masiva' | 'mixto';

export interface TestTareaDto {
  id: string;
  nombre: string;
  descripcion: string;
  exito: number | null;          // % éxito 0-100
  tiempoSegundos: number | null; // segundos promedio
  errores: number | null;        // errores por usuario
  satisfaccion: number | null;   // rating 1-5
  notas: string;
}

export interface TestCuantitativoData {
  contexto: string;
  metodo: MetodoTest;
  participantes: number | null;
  tareas: TestTareaDto[];
  sus: number | null;   // System Usability Scale 0-100
  nps: number | null;   // Net Promoter Score -100 a 100
  notas: string;
}

export const EMPTY_TEST_CUANTITATIVO: TestCuantitativoData = {
  contexto: '',
  metodo: 'encuesta',
  participantes: null,
  tareas: [],
  sus: null,
  nps: null,
  notas: '',
};

export const METODO_OPTIONS: { value: MetodoTest; label: string }[] = [
  { value: 'encuesta', label: 'Encuesta post-task' },
  { value: 'analytics', label: 'Analytics / Métricas' },
  { value: 'ab-testing', label: 'A/B Testing' },
  { value: 'masiva', label: 'Encuesta masiva' },
  { value: 'mixto', label: 'Método mixto' },
];

// ─── Report types ─────────────────────────────────────────────────────────────

export interface TestCuantitativoReportDto {
  executiveSummary: string;
  scoreGlobal: string;
  tareasAnalisis: string[];
  patrones: string[];
  fortalezas: string[];
  debilidades: string[];
  recommendations: string[];
}

export interface TestCuantitativoReportVersionDto {
  version: number;
  generatedAt: string;
  report: TestCuantitativoReportDto;
}

export interface TestCuantitativoAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: TestCuantitativoReportDto;
}
