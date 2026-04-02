import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';
import { PovData, PovAnalyzeResDto } from '@pages/platform/phase-detail/tool-application-detail/tools/pov/pov.types';

export interface PovAnalyzeReqDto {
  toolApplicationId: number;
  data: PovData;
  currentVersion: number;
}

@Injectable({ providedIn: 'root' })
export class PovService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/pov`;

  analyze(dto: PovAnalyzeReqDto): Promise<PovAnalyzeResDto> {
    return this.http
      .request<PovAnalyzeResDto>()
      .post()
      .url(`${this.base}/analyze`)
      .body(dto)
      .send();
  }
}
