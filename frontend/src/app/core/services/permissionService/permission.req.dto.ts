export interface UpdateRolePermissionsRequest {
  roleId: number;
  permissionIds: number[];
}

export interface UpdateUserPermissionOverrideRequest {
  userId: number;
  permissionId: number;
  granted: boolean;
}
