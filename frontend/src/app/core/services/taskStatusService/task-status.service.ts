import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { TaskStatusDto } from '../taskService/task.res.dto';

export interface CreateTaskStatusReqDto {
  projectId: number;
  nombre: string;
  color: string;
  orden: number;
  isFinal?: boolean;
}

export interface UpdateTaskStatusReqDto {
  nombre?: string;
  color?: string;
  orden?: number;
  isFinal?: boolean;
  activo?: boolean;
}

@Injectable({ providedIn: 'root' })
export class TaskStatusService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly baseUrl = `${environment.apiBaseUrl}/task-status`;

  create(dto: CreateTaskStatusReqDto): Promise<TaskStatusDto> {
    return this.http.request<TaskStatusDto>().post().url(`${this.baseUrl}/create`).body(dto).send();
  }

  getByProject(projectId: number): Promise<TaskStatusDto[]> {
    return this.http
      .request<TaskStatusDto[]>()
      .get()
      .url(`${this.baseUrl}/project/${projectId}`)
      .send();
  }

  update(id: number, dto: UpdateTaskStatusReqDto): Promise<TaskStatusDto> {
    return this.http.request<TaskStatusDto>().patch().url(`${this.baseUrl}/${id}`).body(dto).send();
  }

  delete(id: number): Promise<void> {
    return this.http.request<void>().delete().url(`${this.baseUrl}/${id}`).send();
  }
}
