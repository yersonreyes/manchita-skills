import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';
import { RoadmapPrototipadoData, RoadmapPrototipadoReportDto } from '@pages/platform/phase-detail/tool-application-detail/tools/roadmap-prototipado/roadmap-prototipado.types';

export interface RoadmapPrototipadoAnalyzeReq {
  toolApplicationId: number;
  currentVersion: number;
  data: RoadmapPrototipadoData;
}

export interface RoadmapPrototipadoAnalyzeRes {
  version: number;
  generatedAt: string;
  report: RoadmapPrototipadoReportDto;
}

@Injectable({ providedIn: 'root' })
export class RoadmapPrototipadoService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/roadmap-prototipado`;

  analyze(body: RoadmapPrototipadoAnalyzeReq): Promise<RoadmapPrototipadoAnalyzeRes> {
    return this.http
      .request<RoadmapPrototipadoAnalyzeRes>()
      .post()
      .url(`${this.base}/analyze`)
      .body(body)
      .send();
  }
}
