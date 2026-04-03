import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';
import { HibridacionTraslacionData, HibridacionTraslacionAnalyzeResDto } from '@pages/platform/phase-detail/tool-application-detail/tools/hibridacion-traslacion/hibridacion-traslacion.types';

export interface HibridacionTraslacionAnalyzeReqDto {
  toolApplicationId: number;
  data: HibridacionTraslacionData;
  currentVersion: number;
}

@Injectable({ providedIn: 'root' })
export class HibridacionTraslacionService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/hibridacion-traslacion`;

  analyze(dto: HibridacionTraslacionAnalyzeReqDto): Promise<HibridacionTraslacionAnalyzeResDto> {
    return this.http
      .request<HibridacionTraslacionAnalyzeResDto>()
      .post()
      .url(`${this.base}/analyze`)
      .body(dto)
      .send();
  }
}
