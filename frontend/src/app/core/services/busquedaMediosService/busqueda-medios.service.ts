import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';
import {
  BusquedaMediosData,
  BusquedaMediosAnalyzeResDto,
} from '../../../Pages/platform/phase-detail/tool-application-detail/tools/busqueda-medios/busqueda-medios.types';

export interface BusquedaMediosAnalyzeReqDto {
  toolApplicationId: number;
  data: BusquedaMediosData;
  currentVersion: number;
}

@Injectable({ providedIn: 'root' })
export class BusquedaMediosService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/busqueda-medios`;

  analyze(dto: BusquedaMediosAnalyzeReqDto): Promise<BusquedaMediosAnalyzeResDto> {
    return this.http
      .request<BusquedaMediosAnalyzeResDto>()
      .post()
      .url(`${this.base}/analyze`)
      .body(dto)
      .send();
  }
}
