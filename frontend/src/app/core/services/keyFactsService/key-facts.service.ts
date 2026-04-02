import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';
import { KeyFactsData, KeyFactsAnalyzeResDto } from '@pages/platform/phase-detail/tool-application-detail/tools/key-facts/key-facts.types';

export interface KeyFactsAnalyzeReqDto {
  toolApplicationId: number;
  data: KeyFactsData;
  currentVersion: number;
}

@Injectable({ providedIn: 'root' })
export class KeyFactsService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/key-facts`;

  analyze(dto: KeyFactsAnalyzeReqDto): Promise<KeyFactsAnalyzeResDto> {
    return this.http
      .request<KeyFactsAnalyzeResDto>()
      .post()
      .url(`${this.base}/analyze`)
      .body(dto)
      .send();
  }
}
