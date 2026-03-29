import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';
import {
  DiagnosticoInputs,
  DiagnosticoAnalyzeResDto,
} from '../../../Pages/platform/phase-detail/tool-application-detail/tools/diagnostico-industria/diagnostico-industria.types';

export interface DiagnosticoIndustriaReqDto {
  toolApplicationId: number;
  inputs: DiagnosticoInputs;
  currentVersion: number;
}

@Injectable({ providedIn: 'root' })
export class DiagnosticoIndustriaService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/diagnostico-industria`;

  analyze(dto: DiagnosticoIndustriaReqDto): Promise<DiagnosticoAnalyzeResDto> {
    return this.http
      .request<DiagnosticoAnalyzeResDto>()
      .post()
      .url(`${this.base}/analyze`)
      .body(dto)
      .send();
  }
}
