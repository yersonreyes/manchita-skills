import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';
import { HibridacionAgregacionData, HibridacionAgregacionAnalyzeResDto } from '@pages/platform/phase-detail/tool-application-detail/tools/hibridacion-agregacion/hibridacion-agregacion.types';

export interface HibridacionAgregacionAnalyzeReqDto {
  toolApplicationId: number;
  data: HibridacionAgregacionData;
  currentVersion: number;
}

@Injectable({ providedIn: 'root' })
export class HibridacionAgregacionService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/hibridacion-agregacion`;

  analyze(dto: HibridacionAgregacionAnalyzeReqDto): Promise<HibridacionAgregacionAnalyzeResDto> {
    return this.http
      .request<HibridacionAgregacionAnalyzeResDto>()
      .post()
      .url(`${this.base}/analyze`)
      .body(dto)
      .send();
  }
}
