import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';
import { DesafioDisenoData, DesafioDisenoAnalyzeResDto } from '@pages/platform/phase-detail/tool-application-detail/tools/desafio-diseno/desafio-diseno.types';

export interface DesafioDisenoAnalyzeReqDto {
  toolApplicationId: number;
  data: DesafioDisenoData;
  currentVersion: number;
}

@Injectable({ providedIn: 'root' })
export class DesafioDisenoService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/desafio-diseno`;

  analyze(dto: DesafioDisenoAnalyzeReqDto): Promise<DesafioDisenoAnalyzeResDto> {
    return this.http
      .request<DesafioDisenoAnalyzeResDto>()
      .post()
      .url(`${this.base}/analyze`)
      .body(dto)
      .send();
  }
}
