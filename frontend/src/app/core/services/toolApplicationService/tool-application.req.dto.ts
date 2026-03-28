export type ToolApplicationStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export type AttachmentType = 'IMAGE' | 'PDF' | 'LINK' | 'OTHER';

export interface CreateToolApplicationReqDto {
  projectPhaseId: number;
  toolId: number;
  titulo: string;
  structuredData?: Record<string, unknown>;
  estado?: ToolApplicationStatus;
}

export interface UpdateToolApplicationReqDto {
  titulo?: string;
  structuredData?: Record<string, unknown>;
  estado?: ToolApplicationStatus;
}

export interface CreateNoteReqDto {
  contenido: string;
}

export interface UpdateNoteReqDto {
  contenido: string;
}

export interface CreateAttachmentReqDto {
  nombre: string;
  url: string;
  tipo: AttachmentType;
  size?: number | null;
}
