import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';
import { SesionCocreacionData, SesionCocreacionAnalyzeResDto } from '@pages/platform/phase-detail/tool-application-detail/tools/sesion-cocreacion/sesion-cocreacion.types';

export interface SesionCocreacionAnalyzeReqDto {
  toolApplicationId: number;
  data: SesionCocreacionData;
  currentVersion: number;
}

@Injectable({ providedIn: 'root' })
export class SesionCocreacionService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/sesion-cocreacion`;

  analyze(dto: SesionCocreacionAnalyzeReqDto): Promise<SesionCocreacionAnalyzeResDto> {
    return this.http
      .request<SesionCocreacionAnalyzeResDto>()
      .post()
      .url(`${this.base}/analyze`)
      .body(dto)
      .send();
  }
}
