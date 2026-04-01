// ─── Data types ───────────────────────────────────────────────────────────────

export type BuzzReportCanal =
  | 'twitter'
  | 'instagram'
  | 'facebook'
  | 'tiktok'
  | 'linkedin'
  | 'reddit'
  | 'youtube'
  | 'news'
  | 'blog'
  | 'otro';

export type BuzzReportSentiment = 'positivo' | 'neutro' | 'negativo';

export interface BuzzReportMencion {
  id: string;
  canal: BuzzReportCanal;
  sentiment: BuzzReportSentiment;
  autor: string;
  contenido: string;
  alcance: string;
}

export interface BuzzReportData {
  marca: string;
  periodo: string;
  menciones: BuzzReportMencion[];
  temasRecurrentes: string[];
  vocesInfluyentes: string[];
  sentimentOverall: string;
}

export const EMPTY_BUZZ_REPORT: BuzzReportData = {
  marca: '',
  periodo: '',
  menciones: [],
  temasRecurrentes: [],
  vocesInfluyentes: [],
  sentimentOverall: '',
};

// ─── Canal config ─────────────────────────────────────────────────────────────

export interface BuzzReportCanalConfig {
  value: BuzzReportCanal;
  label: string;
  icon: string;
  accentColor: string;
  accentBg: string;
}

export const BUZZ_REPORT_CANALES: BuzzReportCanalConfig[] = [
  { value: 'twitter',   label: 'Twitter/X',  icon: 'pi-twitter',    accentColor: '#1d9bf0', accentBg: '#eff8ff' },
  { value: 'instagram', label: 'Instagram',  icon: 'pi-instagram',  accentColor: '#e1306c', accentBg: '#fdf2f7' },
  { value: 'facebook',  label: 'Facebook',   icon: 'pi-facebook',   accentColor: '#1877f2', accentBg: '#eff4ff' },
  { value: 'tiktok',    label: 'TikTok',     icon: 'pi-mobile',     accentColor: '#010101', accentBg: '#f0f0f0' },
  { value: 'linkedin',  label: 'LinkedIn',   icon: 'pi-linkedin',   accentColor: '#0a66c2', accentBg: '#eef5fd' },
  { value: 'reddit',    label: 'Reddit',     icon: 'pi-comments',   accentColor: '#ff4500', accentBg: '#fff4f0' },
  { value: 'youtube',   label: 'YouTube',    icon: 'pi-video',      accentColor: '#ff0000', accentBg: '#fff0f0' },
  { value: 'news',      label: 'Noticias',   icon: 'pi-file-edit',  accentColor: '#0891b2', accentBg: '#ecfeff' },
  { value: 'blog',      label: 'Blog',       icon: 'pi-pencil',     accentColor: '#7c3aed', accentBg: '#fdf4ff' },
  { value: 'otro',      label: 'Otro',       icon: 'pi-tag',        accentColor: '#6b7280', accentBg: '#f9fafb' },
];

// ─── Sentiment config ─────────────────────────────────────────────────────────

export interface BuzzReportSentimentConfig {
  value: BuzzReportSentiment;
  label: string;
  accentColor: string;
  accentBg: string;
  borderColor: string;
}

export const BUZZ_REPORT_SENTIMENTS: BuzzReportSentimentConfig[] = [
  { value: 'positivo', label: 'Positivo', accentColor: '#16a34a', accentBg: '#f0fdf4', borderColor: '#bbf7d0' },
  { value: 'neutro',   label: 'Neutro',   accentColor: '#6b7280', accentBg: '#f9fafb', borderColor: '#e5e7eb' },
  { value: 'negativo', label: 'Negativo', accentColor: '#dc2626', accentBg: '#fef2f2', borderColor: '#fecaca' },
];

// ─── Report types ─────────────────────────────────────────────────────────────

export interface BuzzReportSentimentBreakdown {
  positivo: number;
  neutro: number;
  negativo: number;
}

export interface BuzzReportCanalInsight {
  canal: string;
  volumen: string;
  sentiment: string;
  insight: string;
}

export interface BuzzReportReportDto {
  executiveSummary: string;
  sentimentBreakdown: BuzzReportSentimentBreakdown;
  sentimentNarrative: string;
  topCanales: BuzzReportCanalInsight[];
  temasPrincipales: string[];
  vocesInfluyentes: string[];
  oportunidades: string[];
  riesgos: string[];
  recommendations: string[];
}

export interface BuzzReportVersionDto {
  version: number;
  generatedAt: string;
  report: BuzzReportReportDto;
}

export interface BuzzReportAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: BuzzReportReportDto;
}
