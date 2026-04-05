export type TaskPriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface CreateTaskReqDto {
  projectId: number;
  parentId?: number;
  statusId: number;
  toolApplicationId?: number;
  assigneeId?: number;
  titulo: string;
  descripcion?: string;
  prioridad?: TaskPriority;
  fechaInicio?: string;
  fechaVencimiento?: string;
  estimacion?: number;
  orden?: number;
  tagIds?: number[];
}

export interface UpdateTaskReqDto {
  titulo?: string;
  descripcion?: string | null;
  prioridad?: TaskPriority;
  statusId?: number;
  assigneeId?: number | null;
  toolApplicationId?: number | null;
  fechaInicio?: string | null;
  fechaVencimiento?: string | null;
  estimacion?: number | null;
  tagIds?: number[];
}

export interface MoveTaskReqDto {
  statusId: number;
  orden: number;
}

export interface ReorderTaskReqDto {
  orden: number;
}

export interface AssignTagReqDto {
  tagId: number;
}
