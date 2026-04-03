export type TecnicaPrototipo =
  | 'sketch'
  | 'paper-prototype'
  | 'wizard-of-oz'
  | 'clickable-mockup'
  | 'mvp-code';

export const TECNICAS_PROTOTIPO: { value: TecnicaPrototipo; label: string; tiempo: string; material: string }[] = [
  { value: 'sketch', label: 'Sketch', tiempo: '2 min', material: 'Papel cualquiera' },
  { value: 'paper-prototype', label: 'Paper Prototype', tiempo: '15 min', material: 'Papel, tijeras, post-its' },
  { value: 'wizard-of-oz', label: 'Wizard of Oz', tiempo: '30 min', material: 'Humanos simulando el sistema' },
  { value: 'clickable-mockup', label: 'Clickable Mockup', tiempo: '1-2 hrs', material: 'Figma, Adobe XD' },
  { value: 'mvp-code', label: 'MVP Code', tiempo: '1-2 días', material: 'Código básico' },
];

export type ResultadoTest = 'exito' | 'fallo' | 'parcial';

export interface SesionTestDto {
  id: string;
  usuario: string;
  resultado: ResultadoTest;
  feedback: string;
}

export type DecisionPrototipo = 'iterar' | 'pivot' | 'avanzar';

export const DECISIONES: { value: DecisionPrototipo; label: string; descripcion: string }[] = [
  { value: 'iterar', label: 'Iterar', descripcion: 'Mejorar la solución actual' },
  { value: 'pivot', label: 'Pivot', descripcion: 'Cambiar de dirección' },
  { value: 'avanzar', label: 'Avanzar', descripcion: 'Pasar a desarrollo' },
];

export interface PrototipoRapidoData {
  preguntaValidar: string;
  tecnica: TecnicaPrototipo | null;
  tiempoInvertido: string;
  descripcionPrototipo: string;
  herramientasUsadas: string[];
  sesionesTest: SesionTestDto[];
  hallazgos: string[];
  decision: DecisionPrototipo | null;
  iteracionesSiguientes: string[];
}

export const EMPTY_PROTOTIPO_RAPIDO: PrototipoRapidoData = {
  preguntaValidar: '',
  tecnica: null,
  tiempoInvertido: '',
  descripcionPrototipo: '',
  herramientasUsadas: [],
  sesionesTest: [],
  hallazgos: [],
  decision: null,
  iteracionesSiguientes: [],
};

// ─── Report ──────────────────────────────────────────────────────────────────

export interface PrototipoRapidoReportDto {
  executiveSummary: string;
  validezDeLaHipotesis: string;
  tasaExitoCalculada: string;
  patronesEnElFeedback: string[];
  hipotesisConfirmadas: string[];
  hipotesisRefutadas: string[];
  riesgosRestantes: string[];
  recommendations: string[];
}

export interface PrototipoRapidoReportVersionDto {
  version: number;
  generatedAt: string;
  report: PrototipoRapidoReportDto;
}
