import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';
import { MatrizTendenciasData, MatrizTendenciasAnalyzeResDto } from '@pages/platform/phase-detail/tool-application-detail/tools/matriz-tendencias/matriz-tendencias.types';

export interface MatrizTendenciasAnalyzeReqDto {
  toolApplicationId: number;
  data: MatrizTendenciasData;
  currentVersion: number;
}

@Injectable({ providedIn: 'root' })
export class MatrizTendenciasService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/matriz-tendencias`;

  analyze(dto: MatrizTendenciasAnalyzeReqDto): Promise<MatrizTendenciasAnalyzeResDto> {
    return this.http
      .request<MatrizTendenciasAnalyzeResDto>()
      .post()
      .url(`${this.base}/analyze`)
      .body(dto)
      .send();
  }
}
