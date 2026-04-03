import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';
import { DisenioEscenariosData, DisenioEscenariosAnalyzeResDto } from '@pages/platform/phase-detail/tool-application-detail/tools/disenio-escenarios/disenio-escenarios.types';

export interface DisenioEscenariosAnalyzeReqDto {
  toolApplicationId: number;
  data: DisenioEscenariosData;
  currentVersion: number;
}

@Injectable({ providedIn: 'root' })
export class DisenioEscenariosService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/disenio-escenarios`;

  analyze(dto: DisenioEscenariosAnalyzeReqDto): Promise<DisenioEscenariosAnalyzeResDto> {
    return this.http
      .request<DisenioEscenariosAnalyzeResDto>()
      .post()
      .url(`${this.base}/analyze`)
      .body(dto)
      .send();
  }
}
