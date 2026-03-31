export type InputTipo = 'informacion' | 'recursos' | 'materiales' | 'externos';
export type OutputTipo = 'producto' | 'datos' | 'feedback' | 'desperdicio';

export interface InOutInputItem {
  id: string;
  tipo: InputTipo;
  descripcion: string;
}

export interface InOutOutputItem {
  id: string;
  tipo: OutputTipo;
  descripcion: string;
}

export interface InOutData {
  proceso: string;
  inputs: InOutInputItem[];
  outputs: InOutOutputItem[];
}

export const EMPTY_IN_OUT: InOutData = {
  proceso: '',
  inputs: [],
  outputs: [],
};

export interface InputTipoMeta {
  value: InputTipo;
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: string;
}

export interface OutputTipoMeta {
  value: OutputTipo;
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: string;
}

export const INPUT_TIPOS: InputTipoMeta[] = [
  { value: 'informacion', label: 'Información', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', icon: 'pi-database' },
  { value: 'recursos',    label: 'Recursos',    color: '#059669', bg: '#f0fdf4', border: '#bbf7d0', icon: 'pi-briefcase' },
  { value: 'materiales',  label: 'Materiales',  color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: 'pi-box' },
  { value: 'externos',    label: 'Externos',    color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', icon: 'pi-globe' },
];

export const OUTPUT_TIPOS: OutputTipoMeta[] = [
  { value: 'producto',    label: 'Producto/Servicio', color: '#059669', bg: '#f0fdf4', border: '#bbf7d0', icon: 'pi-star' },
  { value: 'datos',       label: 'Datos/Info',        color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', icon: 'pi-chart-bar' },
  { value: 'feedback',    label: 'Feedback',          color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: 'pi-comments' },
  { value: 'desperdicio', label: 'Desperdicio',       color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: 'pi-trash' },
];

// ─── Report ───────────────────────────────────────────────────────────────────

export interface InOutReportDto {
  executiveSummary: string;
  inputsOcultos: string[];
  outputsOcultos: string[];
  gapsIdentificados: string[];
  recommendations: string[];
}

export interface InOutReportVersionDto {
  version: number;
  generatedAt: string;
  report: InOutReportDto;
}
