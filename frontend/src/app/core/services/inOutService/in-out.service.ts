import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { InOutData, InOutReportVersionDto } from '../../../Pages/platform/phase-detail/tool-application-detail/tools/in-out/in-out.types';

export interface InOutAnalyzeReqDto {
  toolApplicationId: number;
  data: InOutData;
  currentVersion: number;
}

export interface InOutAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: InOutReportVersionDto['report'];
}

@Injectable({ providedIn: 'root' })
export class InOutService {
  private readonly baseUrl = `${environment.apiBaseUrl}/tool-hub/in-out`;

  constructor(private readonly httpBuilder: HttpPromiseBuilderService) {}

  analyze(dto: InOutAnalyzeReqDto): Promise<InOutAnalyzeResDto> {
    return this.httpBuilder
      .request<InOutAnalyzeResDto>()
      .post()
      .url(`${this.baseUrl}/analyze`)
      .body(dto)
      .send();
  }
}
