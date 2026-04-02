export type ImpactoInsight = 'alto' | 'medio' | 'bajo';

export const IMPACTO_LABELS: Record<ImpactoInsight, string> = {
  alto: 'Alto',
  medio: 'Medio',
  bajo: 'Bajo',
};

export const IMPACTO_COLORS: Record<ImpactoInsight, { bg: string; text: string }> = {
  alto: { bg: '#fde8e8', text: '#dc2626' },
  medio: { bg: '#fef3c7', text: '#d97706' },
  bajo: { bg: '#e0f2fe', text: '#0369a1' },
};

export interface InsightItemDto {
  id: string;
  texto: string;
  impacto: ImpactoInsight;
}

export interface InsightClusterDto {
  id: string;
  nombre: string;
  insights: InsightItemDto[];
}

export interface InsightsClusterData {
  contexto: string;
  clusters: InsightClusterDto[];
}

export const EMPTY_INSIGHTS_CLUSTER: InsightsClusterData = {
  contexto: '',
  clusters: [],
};

export interface AnalisisClusterDto {
  cluster: string;
  insightsClave: string[];
  patron: string;
  implicacion: string;
}

export interface InsightsClusterReportDto {
  executiveSummary: string;
  analisisPorCluster: AnalisisClusterDto[];
  clusterPrioritario: string;
  patronesGlobales: string[];
  tensionesEntreGrupos: string[];
  oportunidadesPrioritarias: string[];
  recommendations: string[];
}

export interface InsightsClusterReportVersionDto {
  version: number;
  generatedAt: string;
  report: InsightsClusterReportDto;
}

export interface InsightsClusterAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: InsightsClusterReportDto;
}
