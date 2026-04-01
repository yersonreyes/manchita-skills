import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';
import {
  EntrevistaExpertoData,
  EntrevistaExpertoAnalyzeResDto,
} from '../../../Pages/platform/phase-detail/tool-application-detail/tools/entrevista-experto/entrevista-experto.types';

export interface EntrevistaExpertoAnalyzeReqDto {
  toolApplicationId: number;
  data: EntrevistaExpertoData;
  currentVersion: number;
}

@Injectable({ providedIn: 'root' })
export class EntrevistaExpertoService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/entrevista-experto`;

  analyze(dto: EntrevistaExpertoAnalyzeReqDto): Promise<EntrevistaExpertoAnalyzeResDto> {
    return this.http
      .request<EntrevistaExpertoAnalyzeResDto>()
      .post()
      .url(`${this.base}/analyze`)
      .body(dto)
      .send();
  }
}
