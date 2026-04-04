import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';
import {
  TestUsuarioData,
  TestUsuarioAnalyzeResDto,
} from '../../../Pages/platform/phase-detail/tool-application-detail/tools/test-usuario/test-usuario.types';

export interface TestUsuarioAnalyzeReqDto {
  toolApplicationId: number;
  data: TestUsuarioData;
  currentVersion: number;
}

@Injectable({ providedIn: 'root' })
export class TestUsuarioService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/test-usuario`;

  analyze(dto: TestUsuarioAnalyzeReqDto): Promise<TestUsuarioAnalyzeResDto> {
    return this.http
      .request<TestUsuarioAnalyzeResDto>()
      .post()
      .url(`${this.base}/analyze`)
      .body(dto)
      .send();
  }
}
