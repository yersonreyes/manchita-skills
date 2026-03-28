import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { DesignPhaseResDto, ToolResDto } from './catalog.res.dto';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly designPhaseUrl = `${environment.apiBaseUrl}/design-phase`;
  private readonly toolUrl = `${environment.apiBaseUrl}/tool`;

  getDesignPhases(): Promise<DesignPhaseResDto[]> {
    return this.http.request<DesignPhaseResDto[]>().get().url(`${this.designPhaseUrl}/all`).silent().send();
  }

  getTools(): Promise<ToolResDto[]> {
    return this.http.request<ToolResDto[]>().get().url(`${this.toolUrl}/all`).silent().send();
  }
}
