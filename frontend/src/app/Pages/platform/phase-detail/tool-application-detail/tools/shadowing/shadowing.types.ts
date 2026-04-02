// ─── Data types ───────────────────────────────────────────────────────────────

export type ShadowingTipo = 'pasivo' | 'activo' | 'remoto' | 'participativo';

export interface ObservacionShadowingDto {
  id: string;
  hora: string;
  observacion: string;
  insight: string;
}

export interface SesionShadowingDto {
  id: string;
  participante: string;
  tipo: ShadowingTipo;
  duracion: string;
  contexto: string;
  observaciones: ObservacionShadowingDto[];
  notas: string;
}

export interface ShadowingData {
  objetivo: string;
  guiaObservacion: string;
  sesiones: SesionShadowingDto[];
  sintesis: string;
}

export const TIPO_LABELS: Record<ShadowingTipo, string> = {
  pasivo: 'Pasivo',
  activo: 'Activo',
  remoto: 'Remoto',
  participativo: 'Participativo',
};

export const TIPO_ICONS: Record<ShadowingTipo, string> = {
  pasivo: 'pi-eye',
  activo: 'pi-comments',
  remoto: 'pi-desktop',
  participativo: 'pi-users',
};

export const TIPO_DESCRIPTIONS: Record<ShadowingTipo, string> = {
  pasivo: 'Solo observar, no interactuar',
  activo: 'Preguntas durante pausas',
  remoto: 'Cámara o screen share',
  participativo: 'Ayudar mientras observás',
};

export const EMPTY_OBSERVACION_SHADOWING = (): ObservacionShadowingDto => ({
  id: crypto.randomUUID(),
  hora: '',
  observacion: '',
  insight: '',
});

export const EMPTY_SESION_SHADOWING = (): SesionShadowingDto => ({
  id: crypto.randomUUID(),
  participante: '',
  tipo: 'pasivo',
  duracion: '',
  contexto: '',
  observaciones: [],
  notas: '',
});

export const EMPTY_SHADOWING: ShadowingData = {
  objetivo: '',
  guiaObservacion: '',
  sesiones: [],
  sintesis: '',
};

// ─── Report types ─────────────────────────────────────────────────────────────

export interface ObservacionDestacadaShadowingDto {
  participante: string;
  hora: string;
  observacion: string;
  insight: string;
}

export interface ShadowingReportDto {
  executiveSummary: string;
  observacionesDestacadas: ObservacionDestacadaShadowingDto[];
  flujosDeTrabajo: string[];
  workaroundsEncontrados: string[];
  painPointsCriticos: string[];
  decisiones: string[];
  oportunidades: string[];
  recommendations: string[];
}

export interface ShadowingReportVersionDto {
  version: number;
  generatedAt: string;
  report: ShadowingReportDto;
}

export interface ShadowingAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: ShadowingReportDto;
}
