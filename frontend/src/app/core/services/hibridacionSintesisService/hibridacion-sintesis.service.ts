import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';
import { HibridacionSintesisData, HibridacionSintesisAnalyzeResDto } from '@pages/platform/phase-detail/tool-application-detail/tools/hibridacion-sintesis/hibridacion-sintesis.types';

export interface HibridacionSintesisAnalyzeReqDto {
  toolApplicationId: number;
  data: HibridacionSintesisData;
  currentVersion: number;
}

@Injectable({ providedIn: 'root' })
export class HibridacionSintesisService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/hibridacion-sintesis`;

  analyze(dto: HibridacionSintesisAnalyzeReqDto): Promise<HibridacionSintesisAnalyzeResDto> {
    return this.http
      .request<HibridacionSintesisAnalyzeResDto>()
      .post()
      .url(`${this.base}/analyze`)
      .body(dto)
      .send();
  }
}
