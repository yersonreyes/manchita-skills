import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';
import { PrototipoFuncionalData, PrototipoFuncionalReportDto } from '@pages/platform/phase-detail/tool-application-detail/tools/prototipo-funcional/prototipo-funcional.types';

export interface PrototipoFuncionalAnalyzeReq {
  toolApplicationId: number;
  currentVersion: number;
  data: PrototipoFuncionalData;
}

export interface PrototipoFuncionalAnalyzeRes {
  version: number;
  generatedAt: string;
  report: PrototipoFuncionalReportDto;
}

@Injectable({ providedIn: 'root' })
export class PrototipoFuncionalService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/prototipo-funcional`;

  analyze(body: PrototipoFuncionalAnalyzeReq): Promise<PrototipoFuncionalAnalyzeRes> {
    return this.http
      .request<PrototipoFuncionalAnalyzeRes>()
      .post()
      .url(`${this.base}/analyze`)
      .body(body)
      .send();
  }
}
