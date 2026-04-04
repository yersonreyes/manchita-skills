import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { TaskTagDto } from '../taskService/task.res.dto';

export interface CreateTaskTagReqDto {
  projectId: number;
  nombre: string;
  color: string;
}

export interface UpdateTaskTagReqDto {
  nombre?: string;
  color?: string;
}

@Injectable({ providedIn: 'root' })
export class TaskTagService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly baseUrl = `${environment.apiBaseUrl}/task-tag`;

  create(dto: CreateTaskTagReqDto): Promise<TaskTagDto> {
    return this.http.request<TaskTagDto>().post().url(`${this.baseUrl}/create`).body(dto).send();
  }

  getByProject(projectId: number): Promise<TaskTagDto[]> {
    return this.http
      .request<TaskTagDto[]>()
      .get()
      .url(`${this.baseUrl}/project/${projectId}`)
      .send();
  }

  update(id: number, dto: UpdateTaskTagReqDto): Promise<TaskTagDto> {
    return this.http.request<TaskTagDto>().patch().url(`${this.baseUrl}/${id}`).body(dto).send();
  }

  delete(id: number): Promise<void> {
    return this.http.request<void>().delete().url(`${this.baseUrl}/${id}`).send();
  }
}
