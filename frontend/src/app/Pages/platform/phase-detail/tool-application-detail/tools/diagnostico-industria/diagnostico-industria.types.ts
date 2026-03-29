// ─── Input types ──────────────────────────────────────────────────────────────

export type DiagnosticoForceKey =
  | 'rivalidad'
  | 'nuevosEntrantes'
  | 'proveedores'
  | 'clientes'
  | 'sustitutos';

export interface DiagnosticoInputs {
  rivalidad: string;
  nuevosEntrantes: string;
  proveedores: string;
  clientes: string;
  sustitutos: string;
  tendencias: string;
}

export const EMPTY_INPUTS: DiagnosticoInputs = {
  rivalidad: '',
  nuevosEntrantes: '',
  proveedores: '',
  clientes: '',
  sustitutos: '',
  tendencias: '',
};

// ─── Force config ─────────────────────────────────────────────────────────────

export interface DiagnosticoForceConfig {
  key: DiagnosticoForceKey;
  label: string;
  description: string;
  icon: string;
  placeholder: string;
  accentColor: string;
  accentBg: string;
  borderColor: string;
  textColor: string;
}

export const DIAGNOSTICO_FORCES: DiagnosticoForceConfig[] = [
  {
    key: 'rivalidad',
    label: 'Rivalidad entre competidores',
    description: '¿Quiénes son los principales competidores? ¿Qué tan intensa es la competencia?',
    icon: 'pi-users',
    placeholder: 'Ej: Hay 3 jugadores dominantes con precios agresivos...',
    accentColor: '#ef4444',
    accentBg: '#fef2f2',
    borderColor: '#fecaca',
    textColor: '#b91c1c',
  },
  {
    key: 'nuevosEntrantes',
    label: 'Amenaza de nuevos entrantes',
    description: '¿Qué barreras de entrada existen? ¿Es fácil para nuevos jugadores entrar?',
    icon: 'pi-sign-in',
    placeholder: 'Ej: Las barreras regulatorias son altas, el capital inicial es elevado...',
    accentColor: '#f97316',
    accentBg: '#fff7ed',
    borderColor: '#fed7aa',
    textColor: '#c2410c',
  },
  {
    key: 'proveedores',
    label: 'Poder de proveedores',
    description: '¿Cuántos proveedores hay? ¿Pueden dictar condiciones o precios?',
    icon: 'pi-box',
    placeholder: 'Ej: Pocos proveedores especializados con precios fijos...',
    accentColor: '#8b5cf6',
    accentBg: '#f5f3ff',
    borderColor: '#ddd6fe',
    textColor: '#7c3aed',
  },
  {
    key: 'clientes',
    label: 'Poder de clientes',
    description: '¿Los clientes pueden presionar precios? ¿Hay muchos o pocos compradores?',
    icon: 'pi-user',
    placeholder: 'Ej: Grandes corporaciones que negocian contratos anuales...',
    accentColor: '#3b82f6',
    accentBg: '#eff6ff',
    borderColor: '#bfdbfe',
    textColor: '#1d4ed8',
  },
  {
    key: 'sustitutos',
    label: 'Amenaza de sustitutos',
    description: '¿Qué productos o servicios alternativos podrían reemplazar la solución?',
    icon: 'pi-sync',
    placeholder: 'Ej: Soluciones manuales o planillas de cálculo como alternativa...',
    accentColor: '#22c55e',
    accentBg: '#f0fdf4',
    borderColor: '#bbf7d0',
    textColor: '#15803d',
  },
];

// ─── Report types ──────────────────────────────────────────────────────────────

export type ForceIntensity = 'BAJA' | 'MEDIA' | 'ALTA';

export interface DiagnosticoForceAnalysis {
  intensity: ForceIntensity;
  analysis: string;
  implications: string[];
}

export interface DiagnosticoReportDto {
  executiveSummary: string;
  forceAnalysis: Record<DiagnosticoForceKey, DiagnosticoForceAnalysis>;
  industryScore: number;
  keyOpportunities: string[];
  keyRisks: string[];
  strategicPosition: string;
  recommendations: string[];
}

export interface DiagnosticoReportVersionDto {
  version: number;
  generatedAt: string;
  report: DiagnosticoReportDto;
}

export interface DiagnosticoAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: DiagnosticoReportDto;
}
