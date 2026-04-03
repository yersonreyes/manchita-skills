export type NivelDemo = 'estatico' | 'interactivo' | 'video' | 'mvp';

export const NIVELES_DEMO: { value: NivelDemo; label: string; descripcion: string; audiencia: string }[] = [
  { value: 'estatico', label: 'Demo estático', descripcion: 'Screenshots y mockups', audiencia: 'Stakeholders internos' },
  { value: 'interactivo', label: 'Demo interactivo', descripcion: 'Prototipo clickable', audiencia: 'Usuarios, clientes' },
  { value: 'video', label: 'Demo en video', descripcion: 'Video del flujo completo', audiencia: 'Todos' },
  { value: 'mvp', label: 'MVP funcional', descripcion: 'Producto funcional real', audiencia: 'Beta users' },
];

export interface PreguntaAnticipada {
  id: string;
  pregunta: string;
  respuesta: string;
}

export interface PrototipoMostrarData {
  audiencia: string;
  nivelDemo: NivelDemo | null;
  mensajeClave: string;
  problemaQueResuelve: string;
  beneficiosDestacados: string[];
  herramientasUsadas: string[];
  preguntasAnticipadas: PreguntaAnticipada[];
  resultadosPresentacion: string;
  feedbackRecibido: string[];
}

export const EMPTY_PROTOTIPO_MOSTRAR: PrototipoMostrarData = {
  audiencia: '',
  nivelDemo: null,
  mensajeClave: '',
  problemaQueResuelve: '',
  beneficiosDestacados: [],
  herramientasUsadas: [],
  preguntasAnticipadas: [],
  resultadosPresentacion: '',
  feedbackRecibido: [],
};

// ─── Report ──────────────────────────────────────────────────────────────────

export interface PrototipoMostrarReportDto {
  executiveSummary: string;
  efectividadNarrativa: string;
  fortalezasDelPitch: string[];
  gapsIdentificados: string[];
  feedbackPatterns: string[];
  pasosSiguientes: string[];
  recommendations: string[];
}

export interface PrototipoMostrarReportVersionDto {
  version: number;
  generatedAt: string;
  report: PrototipoMostrarReportDto;
}
