import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import {
  CreateAttachmentReqDto,
  CreateNoteReqDto,
  CreateToolApplicationReqDto,
  UpdateNoteReqDto,
  UpdateToolApplicationReqDto,
} from './tool-application.req.dto';
import {
  ToolApplicationAttachmentResDto,
  ToolApplicationNoteResDto,
  ToolApplicationResDto,
} from './tool-application.res.dto';

@Injectable({ providedIn: 'root' })
export class ToolApplicationService {
  private readonly http = inject(HttpPromiseBuilderService);
  private readonly baseUrl = `${environment.apiBaseUrl}/tool-application`;

  create(dto: CreateToolApplicationReqDto): Promise<ToolApplicationResDto> {
    return this.http.request<ToolApplicationResDto>().post().url(`${this.baseUrl}/create`).body(dto).send();
  }

  getByPhase(projectPhaseId: number): Promise<ToolApplicationResDto[]> {
    return this.http.request<ToolApplicationResDto[]>().get().url(`${this.baseUrl}/project-phase/${projectPhaseId}`).silent().send();
  }

  getById(id: number): Promise<ToolApplicationResDto> {
    return this.http.request<ToolApplicationResDto>().get().url(`${this.baseUrl}/${id}`).send();
  }

  update(id: number, dto: UpdateToolApplicationReqDto): Promise<ToolApplicationResDto> {
    return this.http.request<ToolApplicationResDto>().patch().url(`${this.baseUrl}/${id}`).body(dto).send();
  }

  addNote(id: number, dto: CreateNoteReqDto): Promise<ToolApplicationNoteResDto> {
    return this.http.request<ToolApplicationNoteResDto>().post().url(`${this.baseUrl}/${id}/notes`).body(dto).send();
  }

  updateNote(noteId: number, dto: UpdateNoteReqDto): Promise<ToolApplicationNoteResDto> {
    return this.http.request<ToolApplicationNoteResDto>().patch().url(`${this.baseUrl}/notes/${noteId}`).body(dto).send();
  }

  deleteNote(noteId: number): Promise<void> {
    return this.http.request<void>().delete().url(`${this.baseUrl}/notes/${noteId}`).send();
  }

  addAttachment(id: number, dto: CreateAttachmentReqDto): Promise<ToolApplicationAttachmentResDto> {
    return this.http.request<ToolApplicationAttachmentResDto>().post().url(`${this.baseUrl}/${id}/attachments`).body(dto).send();
  }

  deleteAttachment(attachmentId: number): Promise<void> {
    return this.http.request<void>().delete().url(`${this.baseUrl}/attachments/${attachmentId}`).send();
  }
}
