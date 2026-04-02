import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';
import { MapaEvolucionInnovacionData, MapaEvolucionAnalyzeResDto } from '@pages/platform/phase-detail/tool-application-detail/tools/mapa-evolucion-innovacion/mapa-evolucion-innovacion.types';

export interface MapaEvolucionInnovacionAnalyzeReqDto {
  toolApplicationId: number;
  data: MapaEvolucionInnovacionData;
  currentVersion: number;
}

@Injectable({ providedIn: 'root' })
export class MapaEvolucionInnovacionService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/mapa-evolucion-innovacion`;

  analyze(dto: MapaEvolucionInnovacionAnalyzeReqDto): Promise<MapaEvolucionAnalyzeResDto> {
    return this.http
      .request<MapaEvolucionAnalyzeResDto>()
      .post()
      .url(`${this.base}/analyze`)
      .body(dto)
      .send();
  }
}
