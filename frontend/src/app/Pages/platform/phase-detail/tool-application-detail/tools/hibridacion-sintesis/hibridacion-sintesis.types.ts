export interface ConceptoBaseDto {
  id: string;
  nombre: string;
  descripcion: string;
  esencia: string;
  contribucion: string;
}

export interface HibridacionSintesisData {
  contexto: string;
  conceptosBase: ConceptoBaseDto[];
  puntosConexion: string[];
  nivelSintesis: string;
  ideaSintetizada: string;
  nuevoParadigma: string;
}

export const EMPTY_HIBRIDACION_SINTESIS: HibridacionSintesisData = {
  contexto: '',
  conceptosBase: [],
  puntosConexion: [],
  nivelSintesis: '',
  ideaSintetizada: '',
  nuevoParadigma: '',
};

export const NIVELES_SINTESIS = [
  { value: 'superficial', label: 'Superficial — combina features visibles' },
  { value: 'estructural', label: 'Estructural — cambia la arquitectura del producto/servicio' },
  { value: 'paradigmatico', label: 'Paradigmático — crea un nuevo modelo mental o categoría' },
];

export interface AnalisisConceptoDto {
  nombre: string;
  esencia: string;
  contribucionReal: string;
  tensionCreativa: string;
}

export interface HibridacionSintesisReportDto {
  executiveSummary: string;
  evaluacionNivel: string;
  analisisConceptos: AnalisisConceptoDto[];
  puntosConexionClave: string[];
  nuevaEsencia: string;
  diferenciacionParadigmatica: string;
  riesgos: string[];
  recommendations: string[];
}

export interface HibridacionSintesisReportVersionDto {
  version: number;
  generatedAt: string;
  report: HibridacionSintesisReportDto;
}

export interface HibridacionSintesisAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: HibridacionSintesisReportDto;
}
