import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';
import { PrototipoFisicoData, PrototipoFisicoReportDto } from '@pages/platform/phase-detail/tool-application-detail/tools/prototipo-fisico/prototipo-fisico.types';

export interface PrototipoFisicoAnalyzeReq {
  toolApplicationId: number;
  currentVersion: number;
  data: PrototipoFisicoData;
}

export interface PrototipoFisicoAnalyzeRes {
  version: number;
  generatedAt: string;
  report: PrototipoFisicoReportDto;
}

@Injectable({ providedIn: 'root' })
export class PrototipoFisicoService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/prototipo-fisico`;

  analyze(body: PrototipoFisicoAnalyzeReq): Promise<PrototipoFisicoAnalyzeRes> {
    return this.http
      .request<PrototipoFisicoAnalyzeRes>()
      .post()
      .url(`${this.base}/analyze`)
      .body(body)
      .send();
  }
}
