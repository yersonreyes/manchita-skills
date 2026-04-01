import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';
import {
  FocusGroupData,
  FocusGroupAnalyzeResDto,
} from '../../../Pages/platform/phase-detail/tool-application-detail/tools/focus-group/focus-group.types';

export interface FocusGroupAnalyzeReqDto {
  toolApplicationId: number;
  data: FocusGroupData;
  currentVersion: number;
}

@Injectable({ providedIn: 'root' })
export class FocusGroupService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/focus-group`;

  analyze(dto: FocusGroupAnalyzeReqDto): Promise<FocusGroupAnalyzeResDto> {
    return this.http
      .request<FocusGroupAnalyzeResDto>()
      .post()
      .url(`${this.base}/analyze`)
      .body(dto)
      .send();
  }
}
