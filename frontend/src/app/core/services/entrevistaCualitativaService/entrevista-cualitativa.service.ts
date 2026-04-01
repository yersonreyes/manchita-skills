import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';
import {
  EntrevistaCualitativaData,
  EntrevistaCualitativaAnalyzeResDto,
} from '../../../Pages/platform/phase-detail/tool-application-detail/tools/entrevista-cualitativa/entrevista-cualitativa.types';

export interface EntrevistaCualitativaAnalyzeReqDto {
  toolApplicationId: number;
  data: EntrevistaCualitativaData;
  currentVersion: number;
}

@Injectable({ providedIn: 'root' })
export class EntrevistaCualitativaService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/entrevista-cualitativa`;

  analyze(dto: EntrevistaCualitativaAnalyzeReqDto): Promise<EntrevistaCualitativaAnalyzeResDto> {
    return this.http
      .request<EntrevistaCualitativaAnalyzeResDto>()
      .post()
      .url(`${this.base}/analyze`)
      .body(dto)
      .send();
  }
}
