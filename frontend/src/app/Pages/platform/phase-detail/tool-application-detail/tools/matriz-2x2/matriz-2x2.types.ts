export type ValorEje = 'alto' | 'bajo';

export interface Matriz2x2Config {
  ejeXNombre: string;
  ejeYNombre: string;
  cuadrante_AX_AY: string;
  cuadrante_BX_AY: string;
  cuadrante_AX_BY: string;
  cuadrante_BX_BY: string;
}

export interface Matriz2x2ItemDto {
  id: string;
  nombre: string;
  descripcion: string;
  ejeX: ValorEje;
  ejeY: ValorEje;
}

export interface Matriz2x2Data {
  contexto: string;
  config: Matriz2x2Config;
  items: Matriz2x2ItemDto[];
}

export const DEFAULT_CONFIG: Matriz2x2Config = {
  ejeXNombre: 'Esfuerzo',
  ejeYNombre: 'Impacto',
  cuadrante_AX_AY: '',
  cuadrante_BX_AY: '',
  cuadrante_AX_BY: '',
  cuadrante_BX_BY: '',
};

export const EMPTY_MATRIZ_2X2: Matriz2x2Data = {
  contexto: '',
  config: { ...DEFAULT_CONFIG },
  items: [],
};

// Quadrant definitions: [ejeX, ejeY, label suffix, css class base]
export interface CuadranteConfig {
  ejeX: ValorEje;
  ejeY: ValorEje;
  position: 'TL' | 'TR' | 'BL' | 'BR'; // top-left, top-right, bottom-left, bottom-right
  bg: string;
  border: string;
  labelColor: string;
  chipBg: string;
  chipText: string;
}

export const CUADRANTES: CuadranteConfig[] = [
  { ejeX: 'bajo', ejeY: 'alto',  position: 'TL', bg: '#eff6ff', border: '#bfdbfe', labelColor: '#1d4ed8', chipBg: '#dbeafe', chipText: '#1d4ed8' },
  { ejeX: 'alto', ejeY: 'alto',  position: 'TR', bg: '#f0fdf4', border: '#bbf7d0', labelColor: '#15803d', chipBg: '#dcfce7', chipText: '#15803d' },
  { ejeX: 'bajo', ejeY: 'bajo',  position: 'BL', bg: '#f9fafb', border: '#e5e7eb', labelColor: '#6b7280', chipBg: '#f3f4f6', chipText: '#6b7280' },
  { ejeX: 'alto', ejeY: 'bajo',  position: 'BR', bg: '#fffbeb', border: '#fde68a', labelColor: '#b45309', chipBg: '#fef3c7', chipText: '#b45309' },
];

export interface Matriz2x2AnalisisItemDto {
  nombre: string;
  cuadrante: string;
  justificacion: string;
}

export interface Matriz2x2ReportDto {
  executiveSummary: string;
  distribucionPorCuadrante: { cuadrante: string; items: string[]; interpretacion: string }[];
  itemsPrioritarios: Matriz2x2AnalisisItemDto[];
  itemsAEvitar: Matriz2x2AnalisisItemDto[];
  patronesIdentificados: string[];
  oportunidades: string[];
  recommendations: string[];
}

export interface Matriz2x2ReportVersionDto {
  version: number;
  generatedAt: string;
  report: Matriz2x2ReportDto;
}

export interface Matriz2x2AnalyzeResDto {
  version: number;
  generatedAt: string;
  report: Matriz2x2ReportDto;
}
