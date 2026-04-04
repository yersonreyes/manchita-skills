import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';

export interface MatrizHipotesisAnalyzeReqDto {
  toolApplicationId: number;
  data: {
    contexto: string;
    hipotesis: {
      id: string;
      formulacion: string;
      impacto: string;
      incertidumbre: string;
      experimento: string;
    }[];
  };
  currentVersion: number;
}

export interface MatrizHipotesisReportResDto {
  executiveSummary: string;
  prioridadValidacion: string;
  hipotesisCriticas: string[];
  experimentosRecomendados: string[];
  riesgosIdentificados: string[];
  recommendations: string[];
}

export interface MatrizHipotesisAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: MatrizHipotesisReportResDto;
}

@Injectable({ providedIn: 'root' })
export class MatrizHipotesisService {
  private readonly baseUrl = `${environment.apiBaseUrl}/tool-hub/matriz-hipotesis`;

  constructor(private readonly httpBuilder: HttpPromiseBuilderService) {}

  analyze(dto: MatrizHipotesisAnalyzeReqDto): Promise<MatrizHipotesisAnalyzeResDto> {
    return this.httpBuilder
      .request<MatrizHipotesisAnalyzeResDto>()
      .post()
      .url(`${this.baseUrl}/analyze`)
      .body(dto)
      .send();
  }
}
