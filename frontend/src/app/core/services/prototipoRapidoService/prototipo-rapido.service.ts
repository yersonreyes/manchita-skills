import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';
import { PrototipoRapidoData, PrototipoRapidoReportDto } from '@pages/platform/phase-detail/tool-application-detail/tools/prototipo-rapido/prototipo-rapido.types';

export interface PrototipoRapidoAnalyzeReq {
  toolApplicationId: number;
  currentVersion: number;
  data: PrototipoRapidoData;
}

export interface PrototipoRapidoAnalyzeRes {
  version: number;
  generatedAt: string;
  report: PrototipoRapidoReportDto;
}

@Injectable({ providedIn: 'root' })
export class PrototipoRapidoService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/prototipo-rapido`;

  analyze(body: PrototipoRapidoAnalyzeReq): Promise<PrototipoRapidoAnalyzeRes> {
    return this.http
      .request<PrototipoRapidoAnalyzeRes>()
      .post()
      .url(`${this.base}/analyze`)
      .body(body)
      .send();
  }
}
