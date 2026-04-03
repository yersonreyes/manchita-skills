import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';
import { PrototipoEmpatizarData, PrototipoEmpatizarReportDto } from '@pages/platform/phase-detail/tool-application-detail/tools/prototipo-empatizar/prototipo-empatizar.types';

export interface PrototipoEmpatizarAnalyzeReq {
  toolApplicationId: number;
  currentVersion: number;
  data: PrototipoEmpatizarData;
}

export interface PrototipoEmpatizarAnalyzeRes {
  version: number;
  generatedAt: string;
  report: PrototipoEmpatizarReportDto;
}

@Injectable({ providedIn: 'root' })
export class PrototipoEmpatizarService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/prototipo-empatizar`;

  analyze(body: PrototipoEmpatizarAnalyzeReq): Promise<PrototipoEmpatizarAnalyzeRes> {
    return this.http
      .request<PrototipoEmpatizarAnalyzeRes>()
      .post()
      .url(`${this.base}/analyze`)
      .body(body)
      .send();
  }
}
