export type TipoPrototipo = 'role-play' | 'bodystorming' | 'environmental' | 'experiencial';

export const TIPOS_PROTOTIPO: { value: TipoPrototipo; label: string; descripcion: string }[] = [
  { value: 'role-play', label: 'Role-play', descripcion: 'Actuar la experiencia' },
  { value: 'bodystorming', label: 'Bodystorming', descripcion: 'Prototipar con el cuerpo' },
  { value: 'environmental', label: 'Environmental', descripcion: 'Recrear el entorno' },
  { value: 'experiencial', label: 'Experiencial', descripcion: 'Vivir la experiencia' },
];

export interface PasoSesionDto {
  id: string;
  descripcion: string;
  observacion: string;
}

export interface PrototipoEmpatizarData {
  tipoPrototipo: TipoPrototipo | null;
  objetivo: string;
  contexto: string;
  participantes: string[];
  pasos: PasoSesionDto[];
  insightsEmocionales: string[];
  friccionesIdentificadas: string[];
  supuestosValidados: string[];
  notas: string;
}

export const EMPTY_PROTOTIPO_EMPATIZAR: PrototipoEmpatizarData = {
  tipoPrototipo: null,
  objetivo: '',
  contexto: '',
  participantes: [],
  pasos: [],
  insightsEmocionales: [],
  friccionesIdentificadas: [],
  supuestosValidados: [],
  notas: '',
};

// ─── Report ──────────────────────────────────────────────────────────────────

export interface FriccionEmocionalDto {
  momento: string;
  emocion: string;
  intensidad: 'alta' | 'media' | 'baja';
}

export interface SupuestoContrastadoDto {
  supuesto: string;
  resultado: 'validado' | 'refutado' | 'parcial';
  evidencia: string;
}

export interface PrototipoEmpatizarReportDto {
  executiveSummary: string;
  nivelEmpatiaAlcanzado: string;
  insightsClaves: string[];
  friccionesEmocionales: FriccionEmocionalDto[];
  supuestosContrastados: SupuestoContrastadoDto[];
  implicacionesDiseno: string[];
  recommendations: string[];
}

export interface PrototipoEmpatizarReportVersionDto {
  version: number;
  generatedAt: string;
  report: PrototipoEmpatizarReportDto;
}
