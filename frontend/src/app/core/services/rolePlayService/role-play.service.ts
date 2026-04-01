import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';
import { RolePlayMessageDto, RolePlayAnalysisDto } from '../../../Pages/platform/phase-detail/tool-application-detail/tools/role-play/role-play.types';

export interface RolePlayChatReqDto {
  toolApplicationId: number;
  userMessage: string;
  history: RolePlayMessageDto[];
}

export interface RolePlayChatResDto {
  assistantMessage: string;
  turnCount: number;
}

export interface RolePlayAnalyzeReqDto {
  toolApplicationId: number;
  history: RolePlayMessageDto[];
}

export interface RolePlayAnalyzeResDto {
  analysis: RolePlayAnalysisDto;
}

@Injectable({ providedIn: 'root' })
export class RolePlayService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/role-play`;

  sendMessage(dto: RolePlayChatReqDto): Promise<RolePlayChatResDto> {
    return this.http
      .request<RolePlayChatResDto>()
      .post()
      .url(`${this.base}/chat`)
      .body(dto)
      .send();
  }

  analyze(dto: RolePlayAnalyzeReqDto): Promise<RolePlayAnalyzeResDto> {
    return this.http
      .request<RolePlayAnalyzeResDto>()
      .post()
      .url(`${this.base}/analyze`)
      .body(dto)
      .send();
  }
}
