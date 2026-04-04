import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';
import {
  TestCuantitativoData,
  TestCuantitativoAnalyzeResDto,
} from '../../../Pages/platform/phase-detail/tool-application-detail/tools/test-cuantitativo/test-cuantitativo.types';

export interface TestCuantitativoAnalyzeReqDto {
  toolApplicationId: number;
  data: TestCuantitativoData;
  currentVersion: number;
}

@Injectable({ providedIn: 'root' })
export class TestCuantitativoService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/test-cuantitativo`;

  analyze(dto: TestCuantitativoAnalyzeReqDto): Promise<TestCuantitativoAnalyzeResDto> {
    return this.http
      .request<TestCuantitativoAnalyzeResDto>()
      .post()
      .url(`${this.base}/analyze`)
      .body(dto)
      .send();
  }
}
