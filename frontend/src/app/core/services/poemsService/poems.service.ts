import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';
import { PoemsData, PoemsAnalyzeResDto } from '@pages/platform/phase-detail/tool-application-detail/tools/poems/poems.types';

export interface PoemsAnalyzeReqDto {
  toolApplicationId: number;
  data: PoemsData;
  currentVersion: number;
}

@Injectable({ providedIn: 'root' })
export class PoemsService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/poems`;

  analyze(dto: PoemsAnalyzeReqDto): Promise<PoemsAnalyzeResDto> {
    return this.http
      .request<PoemsAnalyzeResDto>()
      .post()
      .url(`${this.base}/analyze`)
      .body(dto)
      .send();
  }
}
