import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { AssignRolesRequest, CreateUserRequest, UpdateUserRequest } from './user.req.dto';
import { UserDto } from './user.res.dto';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly baseUrl = `${environment.apiBaseUrl}/user`;

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

  assignRoles(id: number, dto: AssignRolesRequest): Promise<UserDto> {
    return this.httpBuilder
      .request<UserDto>()
      .patch()
      .url(`${this.baseUrl}/${id}/roles`)
      .body(dto)
      .send();
  }
}
