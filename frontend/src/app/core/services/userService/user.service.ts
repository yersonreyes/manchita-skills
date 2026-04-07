import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { AssignRolesRequest, CreateUserRequest, UpdateUserRequest, UpsertUserSkillsRequest } from './user.req.dto';
import { UserDto } from './user.res.dto';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly baseUrl = `${environment.apiBaseUrl}/user`;
  private readonly http = inject(HttpClient);

  constructor(private readonly httpBuilder: HttpPromiseBuilderService) {}

  getAll(): Promise<UserDto[]> {
    return this.httpBuilder
      .request<UserDto[]>()
      .get()
      .url(`${this.baseUrl}/all`)
      .send();
  }

  getById(id: number): Promise<UserDto> {
    return this.httpBuilder
      .request<UserDto>()
      .get()
      .url(`${this.baseUrl}/${id}`)
      .send();
  }

  create(dto: CreateUserRequest): Promise<UserDto> {
    return this.httpBuilder
      .request<UserDto>()
      .post()
      .url(`${this.baseUrl}/create`)
      .body(dto)
      .send();
  }

  update(id: number, dto: UpdateUserRequest): Promise<UserDto> {
    return this.httpBuilder
      .request<UserDto>()
      .patch()
      .url(`${this.baseUrl}/${id}`)
      .body(dto)
      .send();
  }

  async uploadAvatar(id: number, file: File): Promise<UserDto> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await firstValueFrom(
      this.http.post<{ res: UserDto; code: number; message: string }>(
        `${this.baseUrl}/${id}/avatar`,
        formData,
      ),
    );
    return response.res;
  }

  upsertSkills(id: number, dto: UpsertUserSkillsRequest): Promise<UserDto> {
    return this.httpBuilder
      .request<UserDto>()
      .put()
      .url(`${this.baseUrl}/${id}/skills`)
      .body(dto)
      .send();
  }

  assignRoles(id: number, dto: AssignRolesRequest): Promise<UserDto> {
    return this.httpBuilder
      .request<UserDto>()
      .patch()
      .url(`${this.baseUrl}/${id}/roles`)
      .body(dto)
      .send();
  }
}
