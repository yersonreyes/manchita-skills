import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { SafariData, SafariAnalyzeResDto } from '@pages/platform/phase-detail/tool-application-detail/tools/safari/safari.types';

export interface SafariAnalyzeReqDto {
  toolApplicationId: number;
  data: SafariData;
  currentVersion: number;
}

@Injectable({ providedIn: 'root' })
export class SafariService {
  private readonly baseUrl = `${environment.apiBaseUrl}/tool-hub/safari`;

  constructor(private readonly httpBuilder: HttpPromiseBuilderService) {}

  analyze(dto: SafariAnalyzeReqDto): Promise<SafariAnalyzeResDto> {
    return this.httpBuilder
      .request<SafariAnalyzeResDto>()
      .post()
      .url(`${this.baseUrl}/analyze`)
      .body(dto)
      .send();
  }
}
