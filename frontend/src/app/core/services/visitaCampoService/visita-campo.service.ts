import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { VisitaCampoData, VisitaCampoAnalyzeResDto } from '@pages/platform/phase-detail/tool-application-detail/tools/visita-campo/visita-campo.types';

export interface VisitaCampoAnalyzeReqDto {
  toolApplicationId: number;
  data: VisitaCampoData;
  currentVersion: number;
}

@Injectable({ providedIn: 'root' })
export class VisitaCampoService {
  private readonly baseUrl = `${environment.apiBaseUrl}/tool-hub/visita-campo`;

  constructor(private readonly httpBuilder: HttpPromiseBuilderService) {}

  analyze(dto: VisitaCampoAnalyzeReqDto): Promise<VisitaCampoAnalyzeResDto> {
    return this.httpBuilder
      .request<VisitaCampoAnalyzeResDto>()
      .post()
      .url(`${this.baseUrl}/analyze`)
      .body(dto)
      .send();
  }
}
