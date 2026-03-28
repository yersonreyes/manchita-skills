import { DesignPhaseResDto, ToolResDto } from '../catalogService/catalog.res.dto';
import { AttachmentType, ToolApplicationStatus } from './tool-application.req.dto';

export interface ToolApplicationNoteResDto {
  id: number;
  contenido: string;
  createdBy: { id: number; nombre: string };
  createdAt: string;
  updatedAt: string;
}

export interface ToolApplicationAttachmentResDto {
  id: number;
  nombre: string;
  url: string;
  tipo: AttachmentType;
  size?: number | null;
  createdBy: { id: number; nombre: string };
  createdAt: string;
}

export interface ToolApplicationResDto {
  id: number;
  projectPhaseId: number;
  toolId: number;
  titulo: string;
  structuredData: Record<string, unknown>;
  estado: ToolApplicationStatus;
  createdById: number;
  tool: ToolResDto;
  projectPhase: { id: number; phase: DesignPhaseResDto };
  createdBy: { id: number; nombre: string; email: string };
  notes: ToolApplicationNoteResDto[];
  attachments: ToolApplicationAttachmentResDto[];
  createdAt: string;
  updatedAt: string;
}
