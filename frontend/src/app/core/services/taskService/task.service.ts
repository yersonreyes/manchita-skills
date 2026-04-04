import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import {
  AssignTagReqDto,
  CreateTaskReqDto,
  MoveTaskReqDto,
  ReorderTaskReqDto,
  UpdateTaskReqDto,
} from './task.req.dto';
import { TaskResDto } from './task.res.dto';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly baseUrl = `${environment.apiBaseUrl}/task`;

  create(dto: CreateTaskReqDto): Promise<TaskResDto> {
    return this.http.request<TaskResDto>().post().url(`${this.baseUrl}/create`).body(dto).send();
  }

  getByProject(
    projectId: number,
    filters?: {
      statusId?: number;
      assigneeId?: number;
      prioridad?: string;
      tagId?: number;
      fechaDesde?: string;
      fechaHasta?: string;
    },
  ): Promise<TaskResDto[]> {
    const params = new URLSearchParams();
    if (filters?.statusId) params.set('statusId', String(filters.statusId));
    if (filters?.assigneeId) params.set('assigneeId', String(filters.assigneeId));
    if (filters?.prioridad) params.set('prioridad', filters.prioridad);
    if (filters?.tagId) params.set('tagId', String(filters.tagId));
    if (filters?.fechaDesde) params.set('fechaDesde', filters.fechaDesde);
    if (filters?.fechaHasta) params.set('fechaHasta', filters.fechaHasta);
    const qs = params.toString();
    const url = `${this.baseUrl}/project/${projectId}${qs ? '?' + qs : ''}`;
    return this.http.request<TaskResDto[]>().get().url(url).send();
  }

  getById(id: number): Promise<TaskResDto> {
    return this.http.request<TaskResDto>().get().url(`${this.baseUrl}/${id}`).send();
  }

  update(id: number, dto: UpdateTaskReqDto): Promise<TaskResDto> {
    return this.http.request<TaskResDto>().patch().url(`${this.baseUrl}/${id}`).body(dto).send();
  }

  move(id: number, dto: MoveTaskReqDto): Promise<TaskResDto> {
    return this.http.request<TaskResDto>().patch().url(`${this.baseUrl}/${id}/move`).body(dto).send();
  }

  reorder(id: number, dto: ReorderTaskReqDto): Promise<TaskResDto> {
    return this.http
      .request<TaskResDto>()
      .patch()
      .url(`${this.baseUrl}/${id}/reorder`)
      .body(dto)
      .send();
  }

  delete(id: number): Promise<void> {
    return this.http.request<void>().delete().url(`${this.baseUrl}/${id}`).send();
  }

  assignTag(taskId: number, dto: AssignTagReqDto): Promise<TaskResDto> {
    return this.http
      .request<TaskResDto>()
      .post()
      .url(`${this.baseUrl}/${taskId}/tags`)
      .body(dto)
      .send();
  }

  removeTag(taskId: number, tagId: number): Promise<TaskResDto> {
    return this.http
      .request<TaskResDto>()
      .delete()
      .url(`${this.baseUrl}/${taskId}/tags/${tagId}`)
      .send();
  }
}
