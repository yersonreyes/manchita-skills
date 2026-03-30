import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { AnalogosAntilogosItems, AnalogosAntilogosAnalyzeResDto } from '../../../Pages/platform/phase-detail/tool-application-detail/tools/analogos-antilogos/analogos-antilogos.types';

export interface AnalogosAntilogosAnalyzeReqDto {
  toolApplicationId: number;
  items: AnalogosAntilogosItems;
  currentVersion: number;
}

@Injectable({ providedIn: 'root' })
export class AnalogosAntilogosService {
  private readonly baseUrl = `${environment.apiBaseUrl}/tool-hub/analogos-antilogos`;

  constructor(private readonly httpBuilder: HttpPromiseBuilderService) {}

  analyze(dto: AnalogosAntilogosAnalyzeReqDto): Promise<AnalogosAntilogosAnalyzeResDto> {
    return this.httpBuilder
      .request<AnalogosAntilogosAnalyzeResDto>()
      .post()
      .url(`${this.baseUrl}/analyze`)
      .body(dto)
      .send();
  }
}
