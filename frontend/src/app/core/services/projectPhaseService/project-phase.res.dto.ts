import { DesignPhaseResDto } from '../catalogService/catalog.res.dto';
import { PhaseStatus } from './project-phase.req.dto';

export interface ProjectPhaseResDto {
  id: number;
  projectId: number;
  phaseId: number;
  estado: PhaseStatus;
  orden: number;
  notas?: string | null;
  phase: DesignPhaseResDto;
  project: { id: number; nombre: string };
  createdAt: string;
  updatedAt: string;
}
