import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import {
  ChangeRequirementStatusReqDto,
  CreateRequirementReqDto,
  RequirementPriority,
  RequirementStatus,
  RequirementType,
  UpdateRequirementReqDto,
} from './requirement.req.dto';
import { RequirementResDto } from './requirement.res.dto';

@Injectable({ providedIn: 'root' })
export class RequirementService {
  private readonly http = inject(HttpPromiseBuilderService);

  private baseUrl(projectId: number) {
    return `${environment.apiBaseUrl}/projects/${projectId}/requirements`;
  }

  getByProject(
    projectId: number,
    filters?: { type?: RequirementType; status?: RequirementStatus; priority?: RequirementPriority },
  ): Promise<RequirementResDto[]> {
    const params: Record<string, string> = {};
    if (filters?.type) params['type'] = filters.type;
    if (filters?.status) params['status'] = filters.status;
    if (filters?.priority) params['priority'] = filters.priority;

    const query = new URLSearchParams(params).toString();
    const url = query ? `${this.baseUrl(projectId)}?${query}` : this.baseUrl(projectId);

    return this.http.request<RequirementResDto[]>().get().url(url).send();
  }

  create(projectId: number, dto: CreateRequirementReqDto): Promise<RequirementResDto> {
    return this.http.request<RequirementResDto>().post().url(this.baseUrl(projectId)).body(dto).send();
  }

  update(projectId: number, id: number, dto: UpdateRequirementReqDto): Promise<RequirementResDto> {
    return this.http.request<RequirementResDto>().patch().url(`${this.baseUrl(projectId)}/${id}`).body(dto).send();
  }

  changeStatus(projectId: number, id: number, dto: ChangeRequirementStatusReqDto): Promise<RequirementResDto> {
    return this.http.request<RequirementResDto>().patch().url(`${this.baseUrl(projectId)}/${id}/status`).body(dto).send();
  }

  delete(projectId: number, id: number): Promise<void> {
    return this.http.request<void>().delete().url(`${this.baseUrl(projectId)}/${id}`).send();
  }
}
