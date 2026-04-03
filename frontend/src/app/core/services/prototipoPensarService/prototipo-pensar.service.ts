import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';
import { PrototipoPensarData, PrototipoPensarReportDto } from '@pages/platform/phase-detail/tool-application-detail/tools/prototipo-pensar/prototipo-pensar.types';

export interface PrototipoPensarAnalyzeReq {
  toolApplicationId: number;
  currentVersion: number;
  data: PrototipoPensarData;
}

export interface PrototipoPensarAnalyzeRes {
  version: number;
  generatedAt: string;
  report: PrototipoPensarReportDto;
}

@Injectable({ providedIn: 'root' })
export class PrototipoPensarService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/prototipo-pensar`;

  analyze(body: PrototipoPensarAnalyzeReq): Promise<PrototipoPensarAnalyzeRes> {
    return this.http
      .request<PrototipoPensarAnalyzeRes>()
      .post()
      .url(`${this.base}/analyze`)
      .body(body)
      .send();
  }
}
