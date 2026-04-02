// ─── Data types ───────────────────────────────────────────────────────────────

export type CanalMisterioso =
  | 'web'
  | 'mobile-app'
  | 'tienda'
  | 'telefono'
  | 'otro';

export type ImpactoIssue = 'alto' | 'medio' | 'bajo';

export interface PasoVisitaDto {
  id: string;
  descripcion: string;
  tiempoDesc: string;
  notas: string;
}

export interface IssueDto {
  id: string;
  descripcion: string;
  impacto: ImpactoIssue;
  area: string;
}

export interface VisitaMisteriosaDto {
  id: string;
  fecha: string;
  canal: CanalMisterioso;
  escenario: string;
  pasos: PasoVisitaDto[];
  issues: IssueDto[];
  scoreGeneral: number;
  observaciones: string;
}

export interface ClienteMisteriosoData {
  objetivo: string;
  criterios: string;
  visitas: VisitaMisteriosaDto[];
  observacionesGenerales: string;
}

export const CANAL_LABELS: Record<CanalMisterioso, string> = {
  'web': 'Sitio Web',
  'mobile-app': 'App Móvil',
  'tienda': 'Tienda / Punto de Venta',
  'telefono': 'Teléfono / Call Center',
  'otro': 'Otro Canal',
};

export const CANAL_ICONS: Record<CanalMisterioso, string> = {
  'web': 'pi-globe',
  'mobile-app': 'pi-mobile',
  'tienda': 'pi-shop',
  'telefono': 'pi-phone',
  'otro': 'pi-ellipsis-h',
};

export const IMPACTO_COLORS: Record<ImpactoIssue, string> = {
  'alto': '#ef4444',
  'medio': '#f59e0b',
  'bajo': '#6b7280',
};

export const EMPTY_PASO = (): PasoVisitaDto => ({
  id: crypto.randomUUID(),
  descripcion: '',
  tiempoDesc: '',
  notas: '',
});

export const EMPTY_ISSUE = (): IssueDto => ({
  id: crypto.randomUUID(),
  descripcion: '',
  impacto: 'medio',
  area: '',
});

export const EMPTY_VISITA = (): VisitaMisteriosaDto => ({
  id: crypto.randomUUID(),
  fecha: '',
  canal: 'web',
  escenario: '',
  pasos: [],
  issues: [],
  scoreGeneral: 3,
  observaciones: '',
});

export const EMPTY_CLIENTE_MISTERIOSO: ClienteMisteriosoData = {
  objetivo: '',
  criterios: '',
  visitas: [],
  observacionesGenerales: '',
};

// ─── Report types ─────────────────────────────────────────────────────────────

export interface IssuePriorizadoDto {
  issue: string;
  impacto: string;
  canal: string;
  prioridad: string;
}

export interface ClienteMisteriosoReportDto {
  executiveSummary: string;
  issuesPriorizados: IssuePriorizadoDto[];
  patronesDeExperiencia: string[];
  fortalezasDetectadas: string[];
  friccionesCriticas: string[];
  scorePromedioAnalisis: string;
  oportunidades: string[];
  recommendations: string[];
}

export interface ClienteMisteriosoReportVersionDto {
  version: number;
  generatedAt: string;
  report: ClienteMisteriosoReportDto;
}

export interface ClienteMisteriosoAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: ClienteMisteriosoReportDto;
}
