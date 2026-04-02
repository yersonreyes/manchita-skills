import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';
import { Matriz2x2Data, Matriz2x2AnalyzeResDto } from '@pages/platform/phase-detail/tool-application-detail/tools/matriz-2x2/matriz-2x2.types';

export interface Matriz2x2AnalyzeReqDto {
  toolApplicationId: number;
  data: Matriz2x2Data;
  currentVersion: number;
}

@Injectable({ providedIn: 'root' })
export class Matriz2x2Service {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/matriz-2x2`;

  analyze(dto: Matriz2x2AnalyzeReqDto): Promise<Matriz2x2AnalyzeResDto> {
    return this.http
      .request<Matriz2x2AnalyzeResDto>()
      .post()
      .url(`${this.base}/analyze`)
      .body(dto)
      .send();
  }
}
