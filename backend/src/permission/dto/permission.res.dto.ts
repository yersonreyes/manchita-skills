import { ApiProperty } from '@nestjs/swagger';

export class PermissionDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  codigo: string;

  @ApiProperty({ required: false })
  descripcion?: string;

  @ApiProperty()
  activo: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class RoleDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  codigo: string;

  @ApiProperty()
  nombre: string;

  @ApiProperty({ required: false })
  descripcion?: string;

  @ApiProperty()
  activo: boolean;

  @ApiProperty({ type: () => [PermissionDto] })
  permissions?: PermissionDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class GetAllPermissionsResponseDto {
  @ApiProperty({ type: () => [PermissionDto] })
  res: PermissionDto[];

  @ApiProperty()
  message: string;

  @ApiProperty()
  code: number;
}

export class GetAllRolesResponseDto {
  @ApiProperty({ type: () => [RoleDto] })
  res: RoleDto[];

  @ApiProperty()
  message: string;

  @ApiProperty()
  code: number;
}

export class RoleResponseDto {
  @ApiProperty({ type: () => RoleDto })
  res: RoleDto;

  @ApiProperty()
  message: string;

  @ApiProperty()
  code: number;
}

export class ErrorResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty()
  code: number;
}
