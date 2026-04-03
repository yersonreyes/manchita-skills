export type TipoIteracion = 'sketch' | 'wireframe' | 'storyboard' | 'paper-prototype';

export const TIPOS_ITERACION: { value: TipoIteracion; label: string; descripcion: string; tiempo: string }[] = [
  { value: 'sketch', label: 'Sketch', descripcion: 'Dibujo rápido en papel', tiempo: '~5 min' },
  { value: 'wireframe', label: 'Wireframe', descripcion: 'Estructura básica sin estilo', tiempo: '~30 min' },
  { value: 'storyboard', label: 'Storyboard', descripcion: 'Secuencia de pantallas', tiempo: '~1 hora' },
  { value: 'paper-prototype', label: 'Paper Prototype', descripcion: 'Interactivo en papel', tiempo: '~2 horas' },
];

export interface IteracionDto {
  id: string;
  tipo: TipoIteracion | null;
  descripcion: string;
  herramienta: string;
  duracion: string;
  aprendizajes: string[];
  descartada: boolean;
}

export interface PrototipoPensarData {
  preguntaExplorar: string;
  contexto: string;
  iteraciones: IteracionDto[];
  decisionFinal: string;
  proximosPasos: string[];
}

export const EMPTY_PROTOTIPO_PENSAR: PrototipoPensarData = {
  preguntaExplorar: '',
  contexto: '',
  iteraciones: [],
  decisionFinal: '',
  proximosPasos: [],
};

// ─── Report ──────────────────────────────────────────────────────────────────

export interface HipotesisDto {
  hipotesis: string;
  evidencia: string;
}

export interface PrototipoPensarReportDto {
  executiveSummary: string;
  evolucionDelPensamiento: string;
  hipotesisValidadas: HipotesisDto[];
  hipotesisDescartadas: HipotesisDto[];
  aprendizajesClave: string[];
  estadoConfianza: string;
  recommendations: string[];
}

export interface PrototipoPensarReportVersionDto {
  version: number;
  generatedAt: string;
  report: PrototipoPensarReportDto;
}
