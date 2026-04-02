import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';
import { InsightsClusterData, InsightsClusterAnalyzeResDto } from '@pages/platform/phase-detail/tool-application-detail/tools/insights-cluster/insights-cluster.types';

export interface InsightsClusterAnalyzeReqDto {
  toolApplicationId: number;
  data: InsightsClusterData;
  currentVersion: number;
}

@Injectable({ providedIn: 'root' })
export class InsightsClusterService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/insights-cluster`;

  analyze(dto: InsightsClusterAnalyzeReqDto): Promise<InsightsClusterAnalyzeResDto> {
    return this.http
      .request<InsightsClusterAnalyzeResDto>()
      .post()
      .url(`${this.base}/analyze`)
      .body(dto)
      .send();
  }
}
