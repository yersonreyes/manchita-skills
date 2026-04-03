import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';
import { MvpData, MvpReportDto } from '@pages/platform/phase-detail/tool-application-detail/tools/mvp/mvp.types';

export interface MvpAnalyzeReq {
  toolApplicationId: number;
  currentVersion: number;
  data: MvpData;
}

export interface MvpAnalyzeRes {
  version: number;
  generatedAt: string;
  report: MvpReportDto;
}

@Injectable({ providedIn: 'root' })
export class MvpService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/mvp`;

  analyze(body: MvpAnalyzeReq): Promise<MvpAnalyzeRes> {
    return this.http
      .request<MvpAnalyzeRes>()
      .post()
      .url(`${this.base}/analyze`)
      .body(body)
      .send();
  }
}
