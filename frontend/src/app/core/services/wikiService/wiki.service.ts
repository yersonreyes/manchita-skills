import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { CreateWikiPageReqDto, UpdateWikiPageReqDto, WikiPageResDto } from './wiki.dto';

@Injectable({ providedIn: 'root' })
export class WikiService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly baseUrl = `${environment.apiBaseUrl}/wiki`;

  getByProject(projectId: number): Promise<WikiPageResDto[]> {
    return this.http.request<WikiPageResDto[]>().get().url(`${this.baseUrl}/project/${projectId}`).send();
  }

  getById(id: number): Promise<WikiPageResDto> {
    return this.http.request<WikiPageResDto>().get().url(`${this.baseUrl}/${id}`).send();
  }

  create(dto: CreateWikiPageReqDto): Promise<WikiPageResDto> {
    return this.http.request<WikiPageResDto>().post().url(this.baseUrl).body(dto).send();
  }

  update(id: number, dto: UpdateWikiPageReqDto): Promise<WikiPageResDto> {
    return this.http.request<WikiPageResDto>().patch().url(`${this.baseUrl}/${id}`).body(dto).send();
  }

  delete(id: number): Promise<void> {
    return this.http.request<void>().delete().url(`${this.baseUrl}/${id}`).send();
  }
}
