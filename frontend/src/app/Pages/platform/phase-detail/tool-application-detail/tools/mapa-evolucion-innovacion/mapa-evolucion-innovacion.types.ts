export type TipoInnovacion = 'incremental' | 'disruptiva' | 'arquitectural' | 'radical';

export const TIPO_INNOVACION_LABELS: Record<TipoInnovacion, string> = {
  incremental: 'Incremental',
  disruptiva: 'Disruptiva',
  arquitectural: 'Arquitectural',
  radical: 'Radical',
};

export const TIPO_INNOVACION_COLORS: Record<TipoInnovacion, string> = {
  incremental: '#0ea5e9',
  disruptiva: '#ef4444',
  arquitectural: '#8b5cf6',
  radical: '#f59e0b',
};

export interface HitoDto {
  id: string;
  descripcion: string;
  tipoInnovacion: TipoInnovacion;
}

export interface EraEvolucionDto {
  id: string;
  nombre: string;
  periodo: string;
  hitos: HitoDto[];
  puntosInflexion: string[];
  oportunidades: string[];
}

export interface MapaEvolucionInnovacionData {
  industria: string;
  contexto: string;
  eras: EraEvolucionDto[];
}

export const EMPTY_ERA: EraEvolucionDto = {
  id: '',
  nombre: '',
  periodo: '',
  hitos: [],
  puntosInflexion: [],
  oportunidades: [],
};

export const EMPTY_MAPA_EVOLUCION: MapaEvolucionInnovacionData = {
  industria: '',
  contexto: '',
  eras: [],
};

// ─── Report types ─────────────────────────────────────────────────────────────

export interface AnalisisEraDto {
  era: string;
  periodo: string;
  patronInnovacion: string;
  relevanciaActual: string;
}

export interface MapaEvolucionReportDto {
  executiveSummary: string;
  analisisPorEra: AnalisisEraDto[];
  patronesEvolutivos: string[];
  puntosInflexionCriticos: string[];
  gapsIdentificados: string[];
  oportunidadesDeInnovacion: string[];
  recommendations: string[];
}

export interface MapaEvolucionReportVersionDto {
  version: number;
  generatedAt: string;
  report: MapaEvolucionReportDto;
}

export interface MapaEvolucionAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: MapaEvolucionReportDto;
}
