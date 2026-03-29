import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { BmcAnalyzeReqDto } from './bmc.req.dto';
import { BmcAnalyzeResDto } from './bmc.res.dto';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BmcService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/bmc`;

  analyze(dto: BmcAnalyzeReqDto): Promise<BmcAnalyzeResDto> {
    return this.http
      .request<BmcAnalyzeResDto>()
      .post()
      .url(`${this.base}/analyze`)
      .body(dto)
      .send();
  }
}
