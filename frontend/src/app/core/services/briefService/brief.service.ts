import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';
import { BriefData, BriefAnalyzeResDto } from '@pages/platform/phase-detail/tool-application-detail/tools/brief/brief.types';

export interface BriefAnalyzeReqDto {
  toolApplicationId: number;
  data: BriefData;
  currentVersion: number;
}

@Injectable({ providedIn: 'root' })
export class BriefService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/brief`;

  analyze(dto: BriefAnalyzeReqDto): Promise<BriefAnalyzeResDto> {
    return this.http
      .request<BriefAnalyzeResDto>()
      .post()
      .url(`${this.base}/analyze`)
      .body(dto)
      .send();
  }
}
