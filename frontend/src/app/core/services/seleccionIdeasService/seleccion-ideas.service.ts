import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';
import { SeleccionIdeasData, SeleccionIdeasAnalyzeResDto } from '@pages/platform/phase-detail/tool-application-detail/tools/seleccion-ideas/seleccion-ideas.types';

export interface SeleccionIdeasAnalyzeReqDto {
  toolApplicationId: number;
  data: SeleccionIdeasData;
  ideaScores: Record<string, number>;
  currentVersion: number;
}

@Injectable({ providedIn: 'root' })
export class SeleccionIdeasService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/seleccion-ideas`;

  analyze(dto: SeleccionIdeasAnalyzeReqDto): Promise<SeleccionIdeasAnalyzeResDto> {
    return this.http
      .request<SeleccionIdeasAnalyzeResDto>()
      .post()
      .url(`${this.base}/analyze`)
      .body(dto)
      .send();
  }
}
