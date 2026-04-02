import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { ShadowingData, ShadowingAnalyzeResDto } from '@pages/platform/phase-detail/tool-application-detail/tools/shadowing/shadowing.types';

export interface ShadowingAnalyzeReqDto {
  toolApplicationId: number;
  data: ShadowingData;
  currentVersion: number;
}

@Injectable({ providedIn: 'root' })
export class ShadowingService {
  private readonly baseUrl = `${environment.apiBaseUrl}/tool-hub/shadowing`;

  constructor(private readonly httpBuilder: HttpPromiseBuilderService) {}

  analyze(dto: ShadowingAnalyzeReqDto): Promise<ShadowingAnalyzeResDto> {
    return this.httpBuilder
      .request<ShadowingAnalyzeResDto>()
      .post()
      .url(`${this.baseUrl}/analyze`)
      .body(dto)
      .send();
  }
}
