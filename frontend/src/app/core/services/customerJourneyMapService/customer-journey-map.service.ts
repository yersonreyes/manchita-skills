import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';
import {
  CustomerJourneyMapData,
  CustomerJourneyMapAnalyzeResDto,
} from '../../Pages/platform/phase-detail/tool-application-detail/tools/customer-journey-map/customer-journey-map.types';

export interface CustomerJourneyMapAnalyzeReqDto {
  toolApplicationId: number;
  data: CustomerJourneyMapData;
  currentVersion: number;
}

@Injectable({ providedIn: 'root' })
export class CustomerJourneyMapService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/customer-journey-map`;

  analyze(dto: CustomerJourneyMapAnalyzeReqDto): Promise<CustomerJourneyMapAnalyzeResDto> {
    return this.http
      .request<CustomerJourneyMapAnalyzeResDto>()
      .post()
      .url(`${this.base}/analyze`)
      .body(dto)
      .send();
  }
}
