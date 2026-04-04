import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';

export interface MatrizFeedbackAnalyzeReqDto {
  toolApplicationId: number;
  data: {
    contexto: string;
    reforzar: { id: string; texto: string; fuente: string; prioridad: string }[];
    arreglar:  { id: string; texto: string; fuente: string; prioridad: string }[];
    insights:  { id: string; texto: string; fuente: string; prioridad: string }[];
    evaluar:   { id: string; texto: string; fuente: string; prioridad: string }[];
  };
  currentVersion: number;
}

export interface MatrizFeedbackReportResDto {
  executiveSummary: string;
  patronesIdentificados: string;
  prioridadAcciones: string[];
  insightsDestacados: string[];
  feedbackAIgnorar: string;
  recommendations: string[];
}

export interface MatrizFeedbackAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: MatrizFeedbackReportResDto;
}

@Injectable({ providedIn: 'root' })
export class MatrizFeedbackService {
  private readonly baseUrl = `${environment.apiBaseUrl}/tool-hub/matriz-feedback`;

  constructor(private readonly httpBuilder: HttpPromiseBuilderService) {}

  analyze(dto: MatrizFeedbackAnalyzeReqDto): Promise<MatrizFeedbackAnalyzeResDto> {
    return this.httpBuilder
      .request<MatrizFeedbackAnalyzeResDto>()
      .post()
      .url(`${this.baseUrl}/analyze`)
      .body(dto)
      .send();
  }
}
