import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { SistemaData, SistemaReportDto } from '../../../Pages/platform/phase-detail/tool-application-detail/tools/diagrama-sistema/diagrama-sistema.types';

export interface DiagramaSistemaAnalyzeReqDto {
  toolApplicationId: number;
  data: SistemaData;
  currentVersion: number;
}

export interface DiagramaSistemaAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: SistemaReportDto;
}

@Injectable({ providedIn: 'root' })
export class DiagramaSistemaService {
  private readonly baseUrl = `${environment.apiBaseUrl}/tool-hub/diagrama-sistema`;

  constructor(private readonly httpBuilder: HttpPromiseBuilderService) {}

  analyze(dto: DiagramaSistemaAnalyzeReqDto): Promise<DiagramaSistemaAnalyzeResDto> {
    return this.httpBuilder
      .request<DiagramaSistemaAnalyzeResDto>()
      .post()
      .url(`${this.baseUrl}/analyze`)
      .body(dto)
      .send();
  }
}
