import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';
import { MapaActivoExperienciaData, MapaActivoAnalyzeResDto } from '@pages/platform/phase-detail/tool-application-detail/tools/mapa-activo-experiencia/mapa-activo-experiencia.types';

export interface MapaActivoAnalyzeReqDto {
  toolApplicationId: number;
  data: MapaActivoExperienciaData;
  currentVersion: number;
}

@Injectable({ providedIn: 'root' })
export class MapaActivoExperienciaService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/mapa-activo-experiencia`;

  analyze(dto: MapaActivoAnalyzeReqDto): Promise<MapaActivoAnalyzeResDto> {
    return this.http
      .request<MapaActivoAnalyzeResDto>()
      .post()
      .url(`${this.base}/analyze`)
      .body(dto)
      .send();
  }
}
