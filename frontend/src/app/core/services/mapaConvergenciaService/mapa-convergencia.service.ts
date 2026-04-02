import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';
import { MapaConvergenciaData, MapaConvergenciaAnalyzeResDto } from '@pages/platform/phase-detail/tool-application-detail/tools/mapa-convergencia/mapa-convergencia.types';

export interface MapaConvergenciaAnalyzeReqDto {
  toolApplicationId: number;
  data: MapaConvergenciaData;
  currentVersion: number;
}

@Injectable({ providedIn: 'root' })
export class MapaConvergenciaService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/mapa-convergencia`;

  analyze(dto: MapaConvergenciaAnalyzeReqDto): Promise<MapaConvergenciaAnalyzeResDto> {
    return this.http
      .request<MapaConvergenciaAnalyzeResDto>()
      .post()
      .url(`${this.base}/analyze`)
      .body(dto)
      .send();
  }
}
