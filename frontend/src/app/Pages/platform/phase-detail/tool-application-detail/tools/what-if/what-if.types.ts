export interface WhatIfPreguntaDto {
  id: string;
  pregunta: string;
  tipo: string;
  exploracion: string;
  seleccionada: boolean;
}

export interface WhatIfData {
  contexto: string;
  preguntas: WhatIfPreguntaDto[];
  insightsClave: string[];
}

export const EMPTY_WHAT_IF: WhatIfData = {
  contexto: '',
  preguntas: [],
  insightsClave: [],
};

export const TIPOS_WHAT_IF = [
  { value: 'inversion', label: 'Inversión (eliminar algo existente)' },
  { value: 'extremo', label: 'Extremo (llevar algo al límite)' },
  { value: 'tecnologico', label: 'Tecnológico (nueva tecnología disponible)' },
  { value: 'usuario', label: 'Usuario (cambiar quién lo usa)' },
  { value: 'competitivo', label: 'Competitivo (qué hace la competencia)' },
  { value: 'contextual', label: 'Contextual (cambiar el entorno)' },
];

export interface AnalisisPreguntaDto {
  pregunta: string;
  tipo: string;
  potencialInnovador: string;
  implicaciones: string[];
  comoPrototipar: string;
}

export interface WhatIfReportDto {
  executiveSummary: string;
  preguntasMasDisruptivas: AnalisisPreguntaDto[];
  patronesDePensamiento: string[];
  insightsDerivados: string[];
  temasEmergentes: string[];
  recommendations: string[];
}

export interface WhatIfReportVersionDto {
  version: number;
  generatedAt: string;
  report: WhatIfReportDto;
}

export interface WhatIfAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: WhatIfReportDto;
}
