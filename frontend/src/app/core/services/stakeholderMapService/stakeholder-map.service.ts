import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';

export interface StakeholderItemDto {
  id: string;
  nombre: string;
  tipo: string;
  descripcion: string;
}

export interface StakeholderCuadrantesDto {
  'manage-closely': StakeholderItemDto[];
  'keep-satisfied': StakeholderItemDto[];
  'keep-informed': StakeholderItemDto[];
  monitor: StakeholderItemDto[];
}

export interface StakeholderMapAnalyzeReqDto {
  toolApplicationId: number;
  cuadrantes: StakeholderCuadrantesDto;
  currentVersion: number;
}

export interface StakeholderQuadrantAnalysisDto {
  actoresClave: string[];
  dinamica: string;
  accionesRecomendadas: string[];
}

export interface StakeholderMapReportDto {
  executiveSummary: string;
  quadrantAnalysis: {
    'manage-closely': StakeholderQuadrantAnalysisDto;
    'keep-satisfied': StakeholderQuadrantAnalysisDto;
    'keep-informed': StakeholderQuadrantAnalysisDto;
    monitor: StakeholderQuadrantAnalysisDto;
  };
  alianzasEstrategicas: string[];
  riesgosRelacionales: string[];
  recommendations: string[];
}

export interface StakeholderMapAnalyzeResDto {
  version: number;
  generatedAt: string;
  report: StakeholderMapReportDto;
}

@Injectable({ providedIn: 'root' })
export class StakeholderMapService {
  private readonly baseUrl = `${environment.apiBaseUrl}/tool-hub/stakeholder-map`;

  constructor(private readonly httpBuilder: HttpPromiseBuilderService) {}

  analyze(dto: StakeholderMapAnalyzeReqDto): Promise<StakeholderMapAnalyzeResDto> {
    return this.httpBuilder
      .request<StakeholderMapAnalyzeResDto>()
      .post()
      .url(`${this.baseUrl}/analyze`)
      .body(dto)
      .send();
  }
}
