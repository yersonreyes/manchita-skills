import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { AiChatReqDto, AiAnalyzeReqDto } from './ai.req.dto';
import { AiChatResDto, AiAnalyzeResDto } from './ai.res.dto';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AiService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/cinco-porques`;

  sendMessage(dto: AiChatReqDto): Promise<AiChatResDto> {
    return this.http
      .request<AiChatResDto>()
      .post()
      .url(`${this.base}/chat`)
      .body(dto)
      .send();
  }

  analyze(dto: AiAnalyzeReqDto): Promise<AiAnalyzeResDto> {
    return this.http
      .request<AiAnalyzeResDto>()
      .post()
      .url(`${this.base}/analyze`)
      .body(dto)
      .send();
  }
}
