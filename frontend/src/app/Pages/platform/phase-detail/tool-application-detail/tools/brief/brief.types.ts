export interface BriefData {
  contexto: string;
  objetivoPrincipal: string;
  objetivosSecundarios: string[];
  usuarioTarget: string;
  inScope: string[];
  outScope: string[];
  timeline: string;
  budget: string;
  restriccionesTech: string;
  otrasRestricciones: string;
  decisionMaker: string;
  contacto: string;
  equipo: string;
  entregables: string[];
  metricasExito: string[];
  riesgos: string[];
  timelineMilestones: string;
}

export const EMPTY_BRIEF: BriefData = {
  contexto: '',
  objetivoPrincipal: '',
  objetivosSecundarios: [],
  usuarioTarget: '',
  inScope: [],
  outScope: [],
  timeline: '',
  budget: '',
  restriccionesTech: '',
  otrasRestricciones: '',
  decisionMaker: '',
  contacto: '',
  equipo: '',
  entregables: [],
  metricasExito: [],
  riesgos: [],
  timelineMilestones: '',
};

export interface BriefReportDto {
  executiveSummary: string;
  fortalezas: string[];
  gapsCriticos: string[];
  alertas: string[];
  sugerenciasScope: string[];
  recommendations: string[];
}

export interface BriefReportVersionDto {
  version: number;
  generatedAt: string;
  report: BriefReportDto;
}

export interface BriefAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: BriefReportDto;
}
