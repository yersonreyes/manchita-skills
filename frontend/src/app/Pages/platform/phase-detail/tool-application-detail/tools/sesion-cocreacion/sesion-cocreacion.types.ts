export interface ParticipanteDto {
  id: string;
  perfil: string;
  cantidad: number;
}

export interface IdeaDto {
  id: string;
  grupo: string;
  descripcion: string;
  votos: number;
  seleccionada: boolean;
}

export interface SesionCocreacionData {
  objetivo: string;
  modalidad: string;
  participantes: ParticipanteDto[];
  tecnicasUsadas: string[];
  fasesCumplidas: string[];
  ideas: IdeaDto[];
  decisiones: string[];
  aprendizajes: string[];
}

export const EMPTY_SESION_COCREACION: SesionCocreacionData = {
  objetivo: '',
  modalidad: '',
  participantes: [],
  tecnicasUsadas: [],
  fasesCumplidas: [],
  ideas: [],
  decisiones: [],
  aprendizajes: [],
};

export const MODALIDADES = [
  { value: 'presencial', label: 'Presencial' },
  { value: 'remota', label: 'Remota' },
  { value: 'hibrida', label: 'Híbrida' },
];

export const FASES_SESION = [
  { value: 'warm-up', label: 'Warm-up', desc: 'Presentación y calentamiento' },
  { value: 'context-setting', label: 'Context Setting', desc: 'Repasar findings y el problema' },
  { value: 'ideacion', label: 'Generación de Ideas', desc: 'Ideas en grupos o plenario' },
  { value: 'prototipado', label: 'Prototipado', desc: 'Construir algo juntos' },
  { value: 'feedback', label: 'Presentación y Feedback', desc: 'Compartir e iterar' },
];

export const TECNICAS_SUGERIDAS = [
  'Design Charrettes',
  'Collage',
  'Card Sorting',
  'Prototyping hands-on',
  'Wizard of Oz',
  '6-3-5',
  'How Might We',
  'Crazy 8s',
];

export const PERFILES_PARTICIPANTES = [
  'Usuario target',
  'Developer',
  'Diseñador',
  'Product Manager',
  'Marketing',
  'Stakeholder',
  'Investigador',
  'Customer Success',
];

export interface IdeaAnalisisDto {
  grupo: string;
  descripcion: string;
  potencialInnovador: string;
  viabilidad: string;
}

export interface SesionCocreacionReportDto {
  executiveSummary: string;
  ideasDestacadas: IdeaAnalisisDto[];
  patronesEmergentes: string[];
  tensionesCreativas: string[];
  oportunidadesDesarrollo: string[];
  recommendations: string[];
}

export interface SesionCocreacionReportVersionDto {
  version: number;
  generatedAt: string;
  report: SesionCocreacionReportDto;
}

export interface SesionCocreacionAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: SesionCocreacionReportDto;
}
