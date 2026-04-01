import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';
import { PersonaData, PersonaAnalyzeResDto } from '../../../Pages/platform/phase-detail/tool-application-detail/tools/persona/persona.types';

export interface PersonaAnalyzeReqDto {
  toolApplicationId: number;
  data: PersonaData;
  currentVersion: number;
}

@Injectable({ providedIn: 'root' })
export class PersonaService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/persona`;

  analyze(dto: PersonaAnalyzeReqDto): Promise<PersonaAnalyzeResDto> {
    return this.http
      .request<PersonaAnalyzeResDto>()
      .post()
      .url(`${this.base}/analyze`)
      .body(dto)
      .send();
  }
}
