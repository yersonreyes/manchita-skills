import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import {
  CreateAdjuntoReqDto,
  CreateRecursoReqDto,
  UpdateBudgetReqDto,
  UpdateRecursoReqDto,
} from './project-budget.req.dto';
import {
  AdjuntoResDto,
  BudgetSummaryResDto,
  DesgloseMensualItemResDto,
  RecursoResDto,
} from './project-budget.res.dto';

@Injectable({ providedIn: 'root' })
export class ProjectBudgetService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly baseUrl = `${environment.apiBaseUrl}/project`;

  getSummary(projectId: number): Promise<BudgetSummaryResDto> {
    return this.http
      .request<BudgetSummaryResDto>()
      .get()
      .url(`${this.baseUrl}/${projectId}/budget/summary`)
      .send();
  }

  getDesgloseMensual(projectId: number): Promise<DesgloseMensualItemResDto[]> {
    return this.http
      .request<DesgloseMensualItemResDto[]>()
      .get()
      .url(`${this.baseUrl}/${projectId}/budget/desglose-mensual`)
      .send();
  }

  updateBudget(projectId: number, dto: UpdateBudgetReqDto): Promise<BudgetSummaryResDto> {
    return this.http
      .request<BudgetSummaryResDto>()
      .patch()
      .url(`${this.baseUrl}/${projectId}/budget`)
      .body(dto)
      .send();
  }

  createRecurso(projectId: number, dto: CreateRecursoReqDto): Promise<RecursoResDto> {
    return this.http
      .request<RecursoResDto>()
      .post()
      .url(`${this.baseUrl}/${projectId}/budget/recursos`)
      .body(dto)
      .send();
  }

  updateRecurso(projectId: number, recursoId: number, dto: UpdateRecursoReqDto): Promise<RecursoResDto> {
    return this.http
      .request<RecursoResDto>()
      .patch()
      .url(`${this.baseUrl}/${projectId}/budget/recursos/${recursoId}`)
      .body(dto)
      .send();
  }

  deleteRecurso(projectId: number, recursoId: number): Promise<void> {
    return this.http
      .request<void>()
      .delete()
      .url(`${this.baseUrl}/${projectId}/budget/recursos/${recursoId}`)
      .send();
  }

  createAdjunto(projectId: number, recursoId: number, dto: CreateAdjuntoReqDto): Promise<AdjuntoResDto> {
    return this.http
      .request<AdjuntoResDto>()
      .post()
      .url(`${this.baseUrl}/${projectId}/budget/recursos/${recursoId}/adjuntos`)
      .body(dto)
      .send();
  }

  deleteAdjunto(projectId: number, recursoId: number, adjuntoId: number): Promise<void> {
    return this.http
      .request<void>()
      .delete()
      .url(`${this.baseUrl}/${projectId}/budget/recursos/${recursoId}/adjuntos/${adjuntoId}`)
      .send();
  }
}
