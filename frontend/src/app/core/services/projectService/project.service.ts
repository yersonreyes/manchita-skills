import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { CreateProjectReqDto, UpdateProjectReqDto, UpsertMemberReqDto } from './project.req.dto';
import { ProjectResDto } from './project.res.dto';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly baseUrl = `${environment.apiBaseUrl}/project`;

  getAll(): Promise<ProjectResDto[]> {
    return this.http.request<ProjectResDto[]>().get().url(`${this.baseUrl}/all`).silent().send();
  }

  create(dto: CreateProjectReqDto): Promise<ProjectResDto> {
    return this.http.request<ProjectResDto>().post().url(`${this.baseUrl}/create`).body(dto).send();
  }

  update(id: number, dto: UpdateProjectReqDto): Promise<ProjectResDto> {
    return this.http.request<ProjectResDto>().patch().url(`${this.baseUrl}/${id}`).body(dto).send();
  }

  upsertMember(projectId: number, dto: UpsertMemberReqDto): Promise<ProjectResDto> {
    return this.http
      .request<ProjectResDto>()
      .patch()
      .url(`${this.baseUrl}/${projectId}/members`)
      .body(dto)
      .send();
  }

  removeMember(projectId: number, userId: number): Promise<ProjectResDto> {
    return this.http
      .request<ProjectResDto>()
      .delete()
      .url(`${this.baseUrl}/${projectId}/members/${userId}`)
      .send();
  }
}
