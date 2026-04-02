import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';
import { BrainstormingData, BrainstormingAnalyzeResDto } from '@pages/platform/phase-detail/tool-application-detail/tools/brainstorming/brainstorming.types';

export interface BrainstormingAnalyzeReqDto {
  toolApplicationId: number;
  data: BrainstormingData;
  currentVersion: number;
}

@Injectable({ providedIn: 'root' })
export class BrainstormingService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/brainstorming`;

  analyze(dto: BrainstormingAnalyzeReqDto): Promise<BrainstormingAnalyzeResDto> {
    return this.http
      .request<BrainstormingAnalyzeResDto>()
      .post()
      .url(`${this.base}/analyze`)
      .body(dto)
      .send();
  }
}
