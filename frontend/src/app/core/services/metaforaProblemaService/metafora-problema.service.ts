import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';
import { MetaforaProblemaData, MetaforaProblemaAnalyzeResDto } from '@pages/platform/phase-detail/tool-application-detail/tools/metafora-problema/metafora-problema.types';

export interface MetaforaProblemaAnalyzeReqDto {
  toolApplicationId: number;
  data: MetaforaProblemaData;
  currentVersion: number;
}

@Injectable({ providedIn: 'root' })
export class MetaforaProblemaService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/metafora-problema`;

  analyze(dto: MetaforaProblemaAnalyzeReqDto): Promise<MetaforaProblemaAnalyzeResDto> {
    return this.http
      .request<MetaforaProblemaAnalyzeResDto>()
      .post()
      .url(`${this.base}/analyze`)
      .body(dto)
      .send();
  }
}
