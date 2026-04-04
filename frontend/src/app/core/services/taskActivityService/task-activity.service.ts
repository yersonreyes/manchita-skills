import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { TaskActivityDto } from '../taskService/task.res.dto';

export interface TaskActivityPageDto {
  res: TaskActivityDto[];
  total: number;
}

@Injectable({ providedIn: 'root' })
export class TaskActivityService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly baseUrl = `${environment.apiBaseUrl}/task-activity`;

  getByTask(taskId: number, page = 1, limit = 20): Promise<TaskActivityPageDto> {
    return this.http
      .request<TaskActivityPageDto>()
      .get()
      .url(`${this.baseUrl}/task/${taskId}?page=${page}&limit=${limit}`)
      .send();
  }

  getByProject(projectId: number, page = 1, limit = 20): Promise<TaskActivityPageDto> {
    return this.http
      .request<TaskActivityPageDto>()
      .get()
      .url(`${this.baseUrl}/project/${projectId}?page=${page}&limit=${limit}`)
      .send();
  }
}
