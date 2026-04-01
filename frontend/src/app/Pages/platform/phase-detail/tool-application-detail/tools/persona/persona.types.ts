export type PersonaTipo = 'primary' | 'secondary' | 'adverse' | 'stakeholder';

export const PERSONA_TIPO_LABELS: Record<PersonaTipo, string> = {
  primary: 'Primaria',
  secondary: 'Secundaria',
  adverse: 'Adversa (a quien NO servimos)',
  stakeholder: 'Stakeholder (interno)',
};

export interface PersonaData {
  nombre: string;
  apodo: string;
  tipo: PersonaTipo;
  edad: string;
  profesion: string;
  ubicacion: string;
  ingresos: string;
  bio: string;
  motivaciones: string[];
  frustraciones: string[];
  comportamiento: string;
  cita: string;
}

export const EMPTY_PERSONA: PersonaData = {
  nombre: '',
  apodo: '',
  tipo: 'primary',
  edad: '',
  profesion: '',
  ubicacion: '',
  ingresos: '',
  bio: '',
  motivaciones: [],
  frustraciones: [],
  comportamiento: '',
  cita: '',
};

// ─── Report types ─────────────────────────────────────────────────────────────

export interface PersonaReportDto {
  executiveSummary: string;
  insightsDeDiseno: string[];
  oportunidades: string[];
  recommendations: string[];
}

export interface PersonaReportVersionDto {
  version: number;
  generatedAt: string;
  report: PersonaReportDto;
}

export interface PersonaAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: PersonaReportDto;
}
