import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';
import {
  BenchmarkingData,
  BenchmarkingAnalyzeResDto,
} from '../../../Pages/platform/phase-detail/tool-application-detail/tools/benchmarking/benchmarking.types';

export interface BenchmarkingAnalyzeReqDto {
  toolApplicationId: number;
  data: BenchmarkingData;
  currentVersion: number;
}

@Injectable({ providedIn: 'root' })
export class BenchmarkingService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/benchmarking`;

  analyze(dto: BenchmarkingAnalyzeReqDto): Promise<BenchmarkingAnalyzeResDto> {
    return this.http
      .request<BenchmarkingAnalyzeResDto>()
      .post()
      .url(`${this.base}/analyze`)
      .body(dto)
      .send();
  }
}
