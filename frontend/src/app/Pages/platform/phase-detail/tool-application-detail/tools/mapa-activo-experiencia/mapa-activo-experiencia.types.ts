export interface MapaActivoEtapaDto {
  id: string;
  nombre: string;
  acciones: string[];
  touchpoints: string[];
  momentoClave: string;
  oportunidades: string[];
}

export interface MapaActivoExperienciaData {
  contexto: string;
  etapas: MapaActivoEtapaDto[];
}

export const EMPTY_MAPA_ACTIVO: MapaActivoExperienciaData = {
  contexto: '',
  etapas: [],
};

export interface AnalisisEtapaActivoDto {
  etapa: string;
  momentoClave: string;
  oportunidadPrioritaria: string;
  implicacion: string;
}

export interface MapaActivoReportDto {
  executiveSummary: string;
  analisisPorEtapa: AnalisisEtapaActivoDto[];
  momentosCriticos: string[];
  touchpointsPrioritarios: string[];
  mapaDeOportunidades: string[];
  patronesDeComportamiento: string[];
  recommendations: string[];
}

export interface MapaActivoReportVersionDto {
  version: number;
  generatedAt: string;
  report: MapaActivoReportDto;
}

export interface MapaActivoAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: MapaActivoReportDto;
}
