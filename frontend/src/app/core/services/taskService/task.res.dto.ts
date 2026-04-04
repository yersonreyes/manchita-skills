import { TaskPriority } from './task.req.dto';

export interface TaskUserDto {
  id: number;
  nombre: string;
  email: string;
}

export interface TaskStatusDto {
  id: number;
  projectId: number;
  nombre: string;
  color: string;
  orden: number;
  isFinal: boolean;
  activo: boolean;
}

export interface TaskTagDto {
  id: number;
  projectId: number;
  nombre: string;
  color: string;
}

export interface TaskTagAssignmentDto {
  tagId: number;
  tag: TaskTagDto;
}

export interface TaskParentDto {
  id: number;
  titulo: string;
}

export interface TaskToolApplicationDto {
  id: number;
  titulo: string;
}

export interface TaskActivityDto {
  id: number;
  taskId: number;
  userId: number;
  accion: string;
  campoModificado: string | null;
  valorAnterior: string | null;
  valorNuevo: string | null;
  createdAt: string;
  user: TaskUserDto;
  task?: { id: number; titulo: string };
}

export interface TaskResDto {
  id: number;
  projectId: number;
  parentId: number | null;
  statusId: number;
  toolApplicationId: number | null;
  assigneeId: number | null;
  createdById: number;
  titulo: string;
  descripcion: string | null;
  prioridad: TaskPriority;
  fechaInicio: string | null;
  fechaVencimiento: string | null;
  fechaCompletado: string | null;
  estimacion: number | null;
  orden: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  status: TaskStatusDto;
  assignee: TaskUserDto | null;
  createdBy: TaskUserDto;
  parent: TaskParentDto | null;
  toolApplication: TaskToolApplicationDto | null;
  tags: TaskTagAssignmentDto[];
  children?: TaskResDto[];
  activities?: TaskActivityDto[];
  _subtaskCount: number;
  _subtaskCompletedCount: number;
}
