export type RolTipo =
  | 'usuario-primario'
  | 'stakeholder'
  | 'customer-service'
  | 'competidor'
  | 'usuario-nuevo'
  | 'usuario-avanzado'
  | 'otro';

export const ROL_TIPO_LABELS: Record<RolTipo, string> = {
  'usuario-primario': 'Usuario primario',
  'stakeholder': 'Stakeholder',
  'customer-service': 'Customer Service',
  'competidor': 'Competidor',
  'usuario-nuevo': 'Usuario nuevo',
  'usuario-avanzado': 'Usuario avanzado',
  'otro': 'Otro',
};

export interface EscenarioDto {
  titulo: string;
  descripcion: string;
  objetivo: string;
}

export interface RolDto {
  id: string;
  nombre: string;
  tipo: RolTipo;
  descripcion: string;
  brief: string;
}

export interface RolePlayData {
  escenario: EscenarioDto;
  roles: RolDto[];
}

export const EMPTY_ROLE_PLAY: RolePlayData = {
  escenario: { titulo: '', descripcion: '', objetivo: '' },
  roles: [],
};

// ─── Session ─────────────────────────────────────────────────────────────────

export interface RolePlayMessageDto {
  role: 'user' | 'assistant';
  content: string;
}

export interface RolePlayAnalysisDto {
  summary: string;
  insights: string[];
  painPoints: string[];
  recommendations: string[];
}

export interface RolePlaySessionDto {
  sessionId: string;
  toolId: number;
  toolNombre: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'analyzed';
  turnCount: number;
  messages: RolePlayMessageDto[];
  analysis: RolePlayAnalysisDto | null;
}
