import { Injectable, inject } from '@angular/core';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { environment } from '../../../../environments/environment';

export interface AiMessageDto {
  role: 'user' | 'assistant';
  content: string;
}

export interface ProjectBriefContextDto {
  nombre: string;
  tipo?: string | null;
  etapa?: string | null;
  sector?: string | null;
}

export interface ProjectBriefChatReqDto {
  history: AiMessageDto[];
  userMessage: string;
  projectContext: ProjectBriefContextDto;
}

export interface ProjectBriefChatResDto {
  assistantMessage: string;
  turnCount: number;
}

export interface ProjectBriefGenerateReqDto {
  history: AiMessageDto[];
  projectContext: ProjectBriefContextDto;
}

export interface ProjectBriefGenerateResDto {
  contexto: string;
}

@Injectable({ providedIn: 'root' })
export class ProjectBriefService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly base = `${environment.apiBaseUrl}/tool-hub/project-brief`;

  chat(dto: ProjectBriefChatReqDto): Promise<ProjectBriefChatResDto> {
    return this.http
      .request<ProjectBriefChatResDto>()
      .post()
      .url(`${this.base}/chat`)
      .body(dto)
      .send();
  }

  generate(dto: ProjectBriefGenerateReqDto): Promise<ProjectBriefGenerateResDto> {
    return this.http
      .request<ProjectBriefGenerateResDto>()
      .post()
      .url(`${this.base}/generate`)
      .body(dto)
      .send();
  }
}
