import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { InvestigacionRemotaData, InvestigacionRemotaAnalyzeResDto } from '@pages/platform/phase-detail/tool-application-detail/tools/investigacion-remota/investigacion-remota.types';

export interface InvestigacionRemotaAnalyzeReqDto {
  toolApplicationId: number;
  data: InvestigacionRemotaData;
  currentVersion: number;
}

@Injectable({ providedIn: 'root' })
export class InvestigacionRemotaService {
  private readonly baseUrl = `${environment.apiBaseUrl}/tool-hub/investigacion-remota`;

  constructor(private readonly httpBuilder: HttpPromiseBuilderService) {}

  analyze(dto: InvestigacionRemotaAnalyzeReqDto): Promise<InvestigacionRemotaAnalyzeResDto> {
    return this.httpBuilder
      .request<InvestigacionRemotaAnalyzeResDto>()
      .post()
      .url(`${this.baseUrl}/analyze`)
      .body(dto)
      .send();
  }
}
