export type PhaseStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface CreateProjectPhaseReqDto {
  projectId: number;
  phaseId: number;
  orden: number;
  estado?: PhaseStatus;
  notas?: string | null;
}

export interface UpdateProjectPhaseReqDto {
  estado?: PhaseStatus;
  orden?: number;
  notas?: string | null;
}
