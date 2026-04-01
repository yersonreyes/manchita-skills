export type StakeholderCuadrante = 'manage-closely' | 'keep-satisfied' | 'keep-informed' | 'monitor';
export type StakeholderTipo = 'usuario' | 'organizacion' | 'gobierno' | 'proveedor' | 'competidor' | 'regulador' | 'otro';

export interface StakeholderItem {
  id: string;
  nombre: string;
  tipo: StakeholderTipo;
  descripcion: string;
}

export interface StakeholderMapItems {
  'manage-closely': StakeholderItem[];
  'keep-satisfied': StakeholderItem[];
  'keep-informed': StakeholderItem[];
  'monitor': StakeholderItem[];
}

export const EMPTY_STAKEHOLDER_ITEMS: StakeholderMapItems = {
  'manage-closely': [],
  'keep-satisfied': [],
  'keep-informed': [],
  'monitor': [],
};

export interface StakeholderQuadrantConfig {
  key: StakeholderCuadrante;
  label: string;
  estrategia: string;
  poder: 'Alto' | 'Bajo';
  interes: 'Alto' | 'Bajo';
  icon: string;
  accentColor: string;
  accentBg: string;
  borderColor: string;
  textColor: string;
}

export const STAKEHOLDER_QUADRANTS: StakeholderQuadrantConfig[] = [
  {
    key: 'manage-closely',
    label: 'Manage Closely',
    estrategia: 'Involucrar activamente en decisiones',
    poder: 'Alto',
    interes: 'Alto',
    icon: 'pi-star',
    accentColor: '#7c3aed',
    accentBg: '#f5f3ff',
    borderColor: '#ddd6fe',
    textColor: '#5b21b6',
  },
  {
    key: 'keep-satisfied',
    label: 'Keep Satisfied',
    estrategia: 'Mantener satisfechos, evitar sorpresas',
    poder: 'Alto',
    interes: 'Bajo',
    icon: 'pi-shield',
    accentColor: '#2563eb',
    accentBg: '#eff6ff',
    borderColor: '#bfdbfe',
    textColor: '#1d4ed8',
  },
  {
    key: 'keep-informed',
    label: 'Keep Informed',
    estrategia: 'Informar regularmente, escuchar feedback',
    poder: 'Bajo',
    interes: 'Alto',
    icon: 'pi-bell',
    accentColor: '#059669',
    accentBg: '#f0fdf4',
    borderColor: '#bbf7d0',
    textColor: '#047857',
  },
  {
    key: 'monitor',
    label: 'Monitor',
    estrategia: 'Observar, mínimo esfuerzo de comunicación',
    poder: 'Bajo',
    interes: 'Bajo',
    icon: 'pi-eye',
    accentColor: '#64748b',
    accentBg: '#f8fafc',
    borderColor: '#cbd5e1',
    textColor: '#475569',
  },
];

export const STAKEHOLDER_TIPOS: { value: StakeholderTipo; label: string }[] = [
  { value: 'usuario', label: 'Usuario' },
  { value: 'organizacion', label: 'Organización' },
  { value: 'gobierno', label: 'Gobierno' },
  { value: 'proveedor', label: 'Proveedor' },
  { value: 'competidor', label: 'Competidor' },
  { value: 'regulador', label: 'Regulador' },
  { value: 'otro', label: 'Otro' },
];

// ─── Report types ──────────────────────────────────────────────────────────────

export interface StakeholderQuadrantAnalysis {
  actoresClave: string[];
  dinamica: string;
  accionesRecomendadas: string[];
}

export interface StakeholderMapReportDto {
  executiveSummary: string;
  quadrantAnalysis: {
    'manage-closely': StakeholderQuadrantAnalysis;
    'keep-satisfied': StakeholderQuadrantAnalysis;
    'keep-informed': StakeholderQuadrantAnalysis;
    'monitor': StakeholderQuadrantAnalysis;
  };
  alianzasEstrategicas: string[];
  riesgosRelacionales: string[];
  recommendations: string[];
}

export interface StakeholderMapReportVersionDto {
  version: number;
  generatedAt: string;
  report: StakeholderMapReportDto;
}
