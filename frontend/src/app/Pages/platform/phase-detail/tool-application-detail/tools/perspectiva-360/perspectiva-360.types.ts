// ─── Data types ───────────────────────────────────────────────────────────────

export interface PerspectivaSectionDto {
  insights: string[];
  fuentes: string;
  notas: string;
}

export interface Perspectiva360Data {
  objeto: string;
  usuario: PerspectivaSectionDto;
  negocio: PerspectivaSectionDto;
  tecnologia: PerspectivaSectionDto;
  competencia: PerspectivaSectionDto;
  stakeholders: PerspectivaSectionDto;
  legal: PerspectivaSectionDto;
  tendencias: PerspectivaSectionDto;
  sintesis: string;
}

export const PERSPECTIVA_CONFIG: {
  key: keyof Omit<Perspectiva360Data, 'objeto' | 'sintesis'>;
  label: string;
  icon: string;
  color: string;
  pregunta: string;
  placeholder: string;
}[] = [
  {
    key: 'usuario',
    label: 'Usuario',
    icon: 'pi-user',
    color: '#3b82f6',
    pregunta: '¿Qué necesita? ¿Qué le frustra?',
    placeholder: 'Ej: El 70% abandona en el paso de verificación de identidad',
  },
  {
    key: 'negocio',
    label: 'Negocio',
    icon: 'pi-chart-line',
    color: '#10b981',
    pregunta: '¿Cómo genera valor? ¿Cuáles son los KPIs?',
    placeholder: 'Ej: CAC de $50, LTV objetivo de $200 para unit economics positivos',
  },
  {
    key: 'tecnologia',
    label: 'Tecnología',
    icon: 'pi-server',
    color: '#8b5cf6',
    pregunta: '¿Es técnicamente viable? ¿Qué constraints hay?',
    placeholder: 'Ej: La integración con sistemas legacy tomará 3 meses adicionales',
  },
  {
    key: 'competencia',
    label: 'Competencia',
    icon: 'pi-arrows-h',
    color: '#f59e0b',
    pregunta: '¿Qué alternativas hay? ¿Qué hacen mejor/peor?',
    placeholder: 'Ej: Ningún competidor tiene onboarding en menos de 15 minutos',
  },
  {
    key: 'stakeholders',
    label: 'Stakeholders',
    icon: 'pi-users',
    color: '#ec4899',
    pregunta: '¿Quién tiene poder? ¿Qué les importa?',
    placeholder: 'Ej: El área de IT es bloqueadora — necesita 6 meses extra para migraciones',
  },
  {
    key: 'legal',
    label: 'Legal / Regulatorio',
    icon: 'pi-shield',
    color: '#ef4444',
    pregunta: '¿Qué restricciones hay? ¿Qué requiere compliance?',
    placeholder: 'Ej: La regulación KYC requiere aprobación del regulador (mínimo 6 meses)',
  },
  {
    key: 'tendencias',
    label: 'Tendencias',
    icon: 'pi-arrow-up-right',
    color: '#06b6d4',
    pregunta: '¿Hacia dónde va la industria? ¿Qué disrupciones se aproximan?',
    placeholder: 'Ej: Open banking abrirá APIs de bancos para terceros en 2026',
  },
];

const EMPTY_SECTION: PerspectivaSectionDto = {
  insights: [],
  fuentes: '',
  notas: '',
};

export const EMPTY_PERSPECTIVA_360: Perspectiva360Data = {
  objeto: '',
  usuario: { ...EMPTY_SECTION },
  negocio: { ...EMPTY_SECTION },
  tecnologia: { ...EMPTY_SECTION },
  competencia: { ...EMPTY_SECTION },
  stakeholders: { ...EMPTY_SECTION },
  legal: { ...EMPTY_SECTION },
  tendencias: { ...EMPTY_SECTION },
  sintesis: '',
};

// ─── Report types ─────────────────────────────────────────────────────────────

export interface TensionPerspectiva {
  perspectivas: string[];
  tension: string;
  implicancia: string;
}

export interface Perspectiva360ReportDto {
  executiveSummary: string;
  insightsClave: string[];
  tensionesDetectadas: TensionPerspectiva[];
  perspectivaMasRiesgosa: string;
  perspectivaMasOportunidad: string;
  brechaCritica: string;
  oportunidades: string[];
  recommendations: string[];
}

export interface Perspectiva360ReportVersionDto {
  version: number;
  generatedAt: string;
  report: Perspectiva360ReportDto;
}

export interface Perspectiva360AnalyzeResDto {
  version: number;
  generatedAt: string;
  report: Perspectiva360ReportDto;
}
