import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { CreateProjectPhaseReqDto, UpdateProjectPhaseReqDto } from './project-phase.req.dto';
import { ProjectPhaseResDto } from './project-phase.res.dto';

@Injectable({ providedIn: 'root' })
export class ProjectPhaseService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly baseUrl = `${environment.apiBaseUrl}/project-phase`;

  create(dto: CreateProjectPhaseReqDto): Promise<ProjectPhaseResDto> {
    return this.http.request<ProjectPhaseResDto>().post().url(`${this.baseUrl}/create`).body(dto).send();
  }

  getByProject(projectId: number): Promise<ProjectPhaseResDto[]> {
    return this.http.request<ProjectPhaseResDto[]>().get().url(`${this.baseUrl}/project/${projectId}`).silent().send();
  }

  getById(id: number): Promise<ProjectPhaseResDto> {
    return this.http.request<ProjectPhaseResDto>().get().url(`${this.baseUrl}/${id}`).send();
  }

  update(id: number, dto: UpdateProjectPhaseReqDto): Promise<ProjectPhaseResDto> {
    return this.http.request<ProjectPhaseResDto>().patch().url(`${this.baseUrl}/${id}`).body(dto).send();
  }
}
