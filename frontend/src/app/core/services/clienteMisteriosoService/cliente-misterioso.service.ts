import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { ClienteMisteriosoData, ClienteMisteriosoAnalyzeResDto } from '@pages/platform/phase-detail/tool-application-detail/tools/cliente-misterioso/cliente-misterioso.types';

export interface ClienteMisteriosoAnalyzeReqDto {
  toolApplicationId: number;
  data: ClienteMisteriosoData;
  currentVersion: number;
}

@Injectable({ providedIn: 'root' })
export class ClienteMisteriosoService {
  private readonly baseUrl = `${environment.apiBaseUrl}/tool-hub/cliente-misterioso`;

  constructor(private readonly httpBuilder: HttpPromiseBuilderService) {}

  analyze(dto: ClienteMisteriosoAnalyzeReqDto): Promise<ClienteMisteriosoAnalyzeResDto> {
    return this.httpBuilder
      .request<ClienteMisteriosoAnalyzeResDto>()
      .post()
      .url(`${this.baseUrl}/analyze`)
      .body(dto)
      .send();
  }
}
