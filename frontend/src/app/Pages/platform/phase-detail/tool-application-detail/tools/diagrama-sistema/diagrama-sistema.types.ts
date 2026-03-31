export type ActorTipo = 'usuario' | 'organizacion' | 'sistema' | 'gobierno' | 'externo';
export type ConexionTipo = 'relacion' | 'flujo-dinero' | 'flujo-informacion' | 'flujo-producto' | 'regulacion' | 'bucle';
export type FronteraPos = 'dentro' | 'fuera';

export interface SistemaActor {
  id: string;
  nombre: string;
  tipo: ActorTipo;
  frontera: FronteraPos;
}

export interface SistemaConexion {
  id: string;
  fromId: string;
  toId: string;
  tipo: ConexionTipo;
  descripcion: string;
}

export interface SistemaData {
  alcance: string;
  actores: SistemaActor[];
  conexiones: SistemaConexion[];
}

export const EMPTY_SISTEMA: SistemaData = {
  alcance: '',
  actores: [],
  conexiones: [],
};

export interface ActorTipoMeta {
  value: ActorTipo;
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: string;
}

export const ACTOR_TIPOS: ActorTipoMeta[] = [
  { value: 'usuario',      label: 'Usuario',      color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', icon: 'pi-user' },
  { value: 'organizacion', label: 'Organización', color: '#059669', bg: '#f0fdf4', border: '#bbf7d0', icon: 'pi-building' },
  { value: 'sistema',      label: 'Sistema',      color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', icon: 'pi-server' },
  { value: 'gobierno',     label: 'Gobierno',     color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: 'pi-shield' },
  { value: 'externo',      label: 'Externo',      color: '#64748b', bg: '#f8fafc', border: '#cbd5e1', icon: 'pi-globe' },
];

export interface ConexionTipoMeta {
  value: ConexionTipo;
  label: string;
  color: string;
}

export const CONEXION_TIPOS: ConexionTipoMeta[] = [
  { value: 'relacion',          label: 'Relación',             color: '#64748b' },
  { value: 'flujo-dinero',      label: 'Flujo de Dinero',      color: '#059669' },
  { value: 'flujo-informacion', label: 'Flujo de Información', color: '#2563eb' },
  { value: 'flujo-producto',    label: 'Flujo de Producto',    color: '#d97706' },
  { value: 'regulacion',        label: 'Regulación',           color: '#dc2626' },
  { value: 'bucle',             label: 'Bucle',                color: '#7c3aed' },
];

// ─── Report ───────────────────────────────────────────────────────────────────

export interface SistemaReportDto {
  executiveSummary: string;
  actoresClave: string[];
  flujosImportantes: string[];
  buclesIdentificados: string[];
  puntasDePalanca: string[];
  recommendations: string[];
}

export interface SistemaReportVersionDto {
  version: number;
  generatedAt: string;
  report: SistemaReportDto;
}
