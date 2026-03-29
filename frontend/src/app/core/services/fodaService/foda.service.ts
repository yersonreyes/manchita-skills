import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';
import { FodaItems, FodaAnalyzeResDto } from '../../../Pages/platform/phase-detail/tool-application-detail/tools/foda/foda.types';

export interface FodaAnalyzeReqDto {
  toolApplicationId: number;
  items: FodaItems;
  currentVersion: number;
}

@Injectable({ providedIn: 'root' })
export class FodaService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/foda`;

  analyze(dto: FodaAnalyzeReqDto): Promise<FodaAnalyzeResDto> {
    return this.http
      .request<FodaAnalyzeResDto>()
      .post()
      .url(`${this.base}/analyze`)
      .body(dto)
      .send();
  }
}
