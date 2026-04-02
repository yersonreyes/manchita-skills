import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { Perspectiva360Data, Perspectiva360AnalyzeResDto } from '@pages/platform/phase-detail/tool-application-detail/tools/perspectiva-360/perspectiva-360.types';

export interface Perspectiva360AnalyzeReqDto {
  toolApplicationId: number;
  data: Perspectiva360Data;
  currentVersion: number;
}

@Injectable({ providedIn: 'root' })
export class Perspectiva360Service {
  private readonly baseUrl = `${environment.apiBaseUrl}/tool-hub/perspectiva-360`;

  constructor(private readonly httpBuilder: HttpPromiseBuilderService) {}

  analyze(dto: Perspectiva360AnalyzeReqDto): Promise<Perspectiva360AnalyzeResDto> {
    return this.httpBuilder
      .request<Perspectiva360AnalyzeResDto>()
      .post()
      .url(`${this.baseUrl}/analyze`)
      .body(dto)
      .send();
  }
}
