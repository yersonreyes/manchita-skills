export type MaterialFisico =
  | 'carton'
  | 'foam'
  | 'madera-balsa'
  | 'impresion-3d'
  | 'resina'
  | 'otro';

export const MATERIALES_FISICOS: { value: MaterialFisico; label: string; costo: string }[] = [
  { value: 'carton', label: 'Cartón', costo: 'Muy bajo' },
  { value: 'foam', label: 'Foam', costo: 'Bajo' },
  { value: 'madera-balsa', label: 'Madera balsa', costo: 'Bajo' },
  { value: 'impresion-3d', label: 'Impresión 3D', costo: 'Medio' },
  { value: 'resina', label: 'Resina', costo: 'Alto' },
  { value: 'otro', label: 'Otro', costo: '' },
];

export type NivelFidelidad = 'mockup-papel' | 'modelo-funcional' | 'prototipo-usuario' | 'produccion';

export const NIVELES_FIDELIDAD: { value: NivelFidelidad; label: string; descripcion: string }[] = [
  { value: 'mockup-papel', label: 'Mockup de papel', descripcion: 'Cartón, forma básica' },
  { value: 'modelo-funcional', label: 'Modelo funcional', descripcion: 'Con partes móviles' },
  { value: 'prototipo-usuario', label: 'Prototipo de usuario', descripcion: 'Near production' },
  { value: 'produccion', label: 'Producción', descripcion: 'Lo que se fabrica' },
];

export type ResultadoFisico = 'exitoso' | 'con-ajustes' | 'fallido';

export interface IteracionFisicaDto {
  id: string;
  material: MaterialFisico | null;
  materialOtro: string;
  nivel: NivelFidelidad | null;
  descripcion: string;
  tiempoFabricacion: string;
  testRealizado: string;
  resultado: ResultadoFisico | null;
  hallazgos: string[];
}

export interface PrototipoFisicoData {
  objetivo: string;
  productoDescripcion: string;
  iteraciones: IteracionFisicaDto[];
  hallazgosGlobales: string[];
  costoTotal: string;
  decisionFinal: string;
}

export const EMPTY_ITERACION_FISICA: Omit<IteracionFisicaDto, 'id'> = {
  material: null,
  materialOtro: '',
  nivel: null,
  descripcion: '',
  tiempoFabricacion: '',
  testRealizado: '',
  resultado: null,
  hallazgos: [],
};

export const EMPTY_PROTOTIPO_FISICO: PrototipoFisicoData = {
  objetivo: '',
  productoDescripcion: '',
  iteraciones: [],
  hallazgosGlobales: [],
  costoTotal: '',
  decisionFinal: '',
};

// ─── Report ──────────────────────────────────────────────────────────────────

export interface PrototipoFisicoReportDto {
  executiveSummary: string;
  evaluacionProgresion: string;
  hallazgosErgonomicos: string[];
  problemasDetectados: string[];
  mejorasValidadas: string[];
  riesgosParaProduccion: string[];
  recommendations: string[];
}

export interface PrototipoFisicoReportVersionDto {
  version: number;
  generatedAt: string;
  report: PrototipoFisicoReportDto;
}
