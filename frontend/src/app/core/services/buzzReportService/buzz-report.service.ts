import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';
import {
  BuzzReportData,
  BuzzReportAnalyzeResDto,
} from '../../../Pages/platform/phase-detail/tool-application-detail/tools/buzz-report/buzz-report.types';

export interface BuzzReportAnalyzeReqDto {
  toolApplicationId: number;
  data: BuzzReportData;
  currentVersion: number;
}

@Injectable({ providedIn: 'root' })
export class BuzzReportService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/buzz-report`;

  analyze(dto: BuzzReportAnalyzeReqDto): Promise<BuzzReportAnalyzeResDto> {
    return this.http
      .request<BuzzReportAnalyzeResDto>()
      .post()
      .url(`${this.base}/analyze`)
      .body(dto)
      .send();
  }
}
