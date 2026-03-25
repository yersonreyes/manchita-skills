import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpPromiseBuilderService } from '../http-promise-builder.service';
import { UpdateRolePermissionsRequest, UpdateUserPermissionOverrideRequest } from './permission.req.dto';
import { PermissionDto, RoleDto } from './permission.res.dto';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly baseUrl = `${environment.apiBaseUrl}/permission`;

  constructor(private readonly httpBuilder: HttpPromiseBuilderService) {}

  getAllPermissions(): Promise<PermissionDto[]> {
    return this.httpBuilder
      .request<PermissionDto[]>()
      .get()
      .url(`${this.baseUrl}/all`)
      .send();
  }

  getAllRoles(): Promise<RoleDto[]> {
    return this.httpBuilder
      .request<RoleDto[]>()
      .get()
      .url(`${this.baseUrl}/roles`)
      .send();
  }

  updateRolePermissions(dto: UpdateRolePermissionsRequest): Promise<RoleDto> {
    return this.httpBuilder
      .request<RoleDto>()
      .patch()
      .url(`${this.baseUrl}/role-permissions`)
      .body(dto)
      .send();
  }

  setUserPermissionOverride(dto: UpdateUserPermissionOverrideRequest): Promise<unknown> {
    return this.httpBuilder
      .request<unknown>()
      .patch()
      .url(`${this.baseUrl}/user-override`)
      .body(dto)
      .send();
  }
}
