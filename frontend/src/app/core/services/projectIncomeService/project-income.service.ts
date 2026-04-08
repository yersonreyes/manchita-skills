import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import {
  CreateIngresoAdjuntoReqDto,
  CreateIngresoReqDto,
  UpdateIngresoReqDto,
} from './project-income.req.dto';
import {
  IngresoAdjuntoResDto,
  IngresoResDto,
  IngresoSummaryResDto,
} from './project-income.res.dto';

@Injectable({ providedIn: 'root' })
export class ProjectIncomeService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly baseUrl = `${environment.apiBaseUrl}/project`;

  getAll(projectId: number): Promise<IngresoResDto[]> {
    return this.http
      .request<IngresoResDto[]>()
      .get()
      .url(`${this.baseUrl}/${projectId}/income`)
      .send();
  }

  getSummary(projectId: number): Promise<IngresoSummaryResDto> {
    return this.http
      .request<IngresoSummaryResDto>()
      .get()
      .url(`${this.baseUrl}/${projectId}/income/summary`)
      .send();
  }

  create(projectId: number, dto: CreateIngresoReqDto): Promise<IngresoResDto> {
    return this.http
      .request<IngresoResDto>()
      .post()
      .url(`${this.baseUrl}/${projectId}/income`)
      .body(dto)
      .send();
  }

  update(projectId: number, ingresoId: number, dto: UpdateIngresoReqDto): Promise<IngresoResDto> {
    return this.http
      .request<IngresoResDto>()
      .patch()
      .url(`${this.baseUrl}/${projectId}/income/${ingresoId}`)
      .body(dto)
      .send();
  }

  remove(projectId: number, ingresoId: number): Promise<void> {
    return this.http
      .request<void>()
      .delete()
      .url(`${this.baseUrl}/${projectId}/income/${ingresoId}`)
      .send();
  }

  createAdjunto(projectId: number, ingresoId: number, dto: CreateIngresoAdjuntoReqDto): Promise<IngresoAdjuntoResDto> {
    return this.http
      .request<IngresoAdjuntoResDto>()
      .post()
      .url(`${this.baseUrl}/${projectId}/income/${ingresoId}/adjuntos`)
      .body(dto)
      .send();
  }

  deleteAdjunto(projectId: number, ingresoId: number, adjuntoId: number): Promise<void> {
    return this.http
      .request<void>()
      .delete()
      .url(`${this.baseUrl}/${projectId}/income/${ingresoId}/adjuntos/${adjuntoId}`)
      .send();
  }
}
