import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';
import { WhatIfData, WhatIfAnalyzeResDto } from '@pages/platform/phase-detail/tool-application-detail/tools/what-if/what-if.types';

export interface WhatIfAnalyzeReqDto {
  toolApplicationId: number;
  data: WhatIfData;
  currentVersion: number;
}

@Injectable({ providedIn: 'root' })
export class WhatIfService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/what-if`;

  analyze(dto: WhatIfAnalyzeReqDto): Promise<WhatIfAnalyzeResDto> {
    return this.http
      .request<WhatIfAnalyzeResDto>()
      .post()
      .url(`${this.base}/analyze`)
      .body(dto)
      .send();
  }
}
