import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';
import {
  FotoVideoEtnografiaData,
  FotoVideoEtnografiaAnalyzeResDto,
} from '../../../Pages/platform/phase-detail/tool-application-detail/tools/foto-video-etnografia/foto-video-etnografia.types';

export interface FotoVideoEtnografiaAnalyzeReqDto {
  toolApplicationId: number;
  data: FotoVideoEtnografiaData;
  currentVersion: number;
}

@Injectable({ providedIn: 'root' })
export class FotoVideoEtnografiaService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/foto-video-etnografia`;

  analyze(dto: FotoVideoEtnografiaAnalyzeReqDto): Promise<FotoVideoEtnografiaAnalyzeResDto> {
    return this.http
      .request<FotoVideoEtnografiaAnalyzeResDto>()
      .post()
      .url(`${this.base}/analyze`)
      .body(dto)
      .send();
  }
}
