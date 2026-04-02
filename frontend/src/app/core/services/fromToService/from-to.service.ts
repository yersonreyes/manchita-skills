import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';
import { FromToData, FromToAnalyzeResDto } from '@pages/platform/phase-detail/tool-application-detail/tools/from-to/from-to.types';

export interface FromToAnalyzeReqDto {
  toolApplicationId: number;
  data: FromToData;
  currentVersion: number;
}

@Injectable({ providedIn: 'root' })
export class FromToService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/from-to`;

  analyze(dto: FromToAnalyzeReqDto): Promise<FromToAnalyzeResDto> {
    return this.http
      .request<FromToAnalyzeResDto>()
      .post()
      .url(`${this.base}/analyze`)
      .body(dto)
      .send();
  }
}
