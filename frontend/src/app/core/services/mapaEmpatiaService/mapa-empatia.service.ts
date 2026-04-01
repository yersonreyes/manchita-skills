import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';
import { MapaEmpatiaData, MapaEmpatiaAnalyzeResDto } from '../../../Pages/platform/phase-detail/tool-application-detail/tools/mapa-empatia/mapa-empatia.types';

export interface MapaEmpatiaAnalyzeReqDto {
  toolApplicationId: number;
  data: MapaEmpatiaData;
  currentVersion: number;
}

@Injectable({ providedIn: 'root' })
export class MapaEmpatiaService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/mapa-empatia`;

  analyze(dto: MapaEmpatiaAnalyzeReqDto): Promise<MapaEmpatiaAnalyzeResDto> {
    return this.http
      .request<MapaEmpatiaAnalyzeResDto>()
      .post()
      .url(`${this.base}/analyze`)
      .body(dto)
      .send();
  }
}
