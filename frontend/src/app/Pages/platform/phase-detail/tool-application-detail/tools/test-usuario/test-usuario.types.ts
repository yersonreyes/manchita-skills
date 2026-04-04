// ─── Data types ───────────────────────────────────────────────────────────────

export type TipoTest = 'moderado' | 'no-moderado' | 'remoto' | 'presencial' | 'guerrilla';
export type ExitoTarea = 'si' | 'parcial' | 'no' | null;

export interface TareaObservadaDto {
  id: string;
  nombre: string;
  exito: ExitoTarea;
  tiempoSegundos: number | null;
  observaciones: string;
}

export interface SesionTestDto {
  id: string;
  participante: string;
  perfil: string;
  fecha: string;
  tipo: TipoTest;
  tareas: TareaObservadaDto[];
  hallazgos: string;
  citas: string[];
}

export interface TestUsuarioData {
  objetivos: string;
  prototipo: string;
  sesiones: SesionTestDto[];
  notas: string;
}

export const EMPTY_TEST_USUARIO: TestUsuarioData = {
  objetivos: '',
  prototipo: '',
  sesiones: [],
  notas: '',
};

export const TIPO_OPTIONS: { value: TipoTest; label: string }[] = [
  { value: 'moderado', label: 'Moderado' },
  { value: 'no-moderado', label: 'No moderado' },
  { value: 'remoto', label: 'Remoto' },
  { value: 'presencial', label: 'Presencial' },
  { value: 'guerrilla', label: 'Guerrilla' },
];

// ─── Report types ─────────────────────────────────────────────────────────────

export interface TestUsuarioReportDto {
  executiveSummary: string;
  tasaExitoGlobal: string;
  problemasRecurrentes: string[];
  hallazgosDestacados: string[];
  citasRelevantes: string[];
  patronesComportamiento: string[];
  recommendations: string[];
}

export interface TestUsuarioReportVersionDto {
  version: number;
  generatedAt: string;
  report: TestUsuarioReportDto;
}

export interface TestUsuarioAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: TestUsuarioReportDto;
}
