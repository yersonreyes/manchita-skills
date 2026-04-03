import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';
import { PrototipoMostrarData, PrototipoMostrarReportDto } from '@pages/platform/phase-detail/tool-application-detail/tools/prototipo-mostrar/prototipo-mostrar.types';

export interface PrototipoMostrarAnalyzeReq {
  toolApplicationId: number;
  currentVersion: number;
  data: PrototipoMostrarData;
}

export interface PrototipoMostrarAnalyzeRes {
  version: number;
  generatedAt: string;
  report: PrototipoMostrarReportDto;
}

@Injectable({ providedIn: 'root' })
export class PrototipoMostrarService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/prototipo-mostrar`;

  analyze(body: PrototipoMostrarAnalyzeReq): Promise<PrototipoMostrarAnalyzeRes> {
    return this.http
      .request<PrototipoMostrarAnalyzeRes>()
      .post()
      .url(`${this.base}/analyze`)
      .body(body)
      .send();
  }
}
