export interface BmcBlockAnalysisDto {
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export interface BmcReportDto {
  executiveSummary: string;
  blockAnalysis: Record<string, BmcBlockAnalysisDto>;
  coherenceScore: number;
  risks: string[];
  recommendations: string[];
}

export interface BmcReportVersionDto {
  version: number;
  generatedAt: string;
  report: BmcReportDto;
}

export interface BmcAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: BmcReportDto;
}
