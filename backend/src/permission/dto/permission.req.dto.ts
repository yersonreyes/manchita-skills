import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNumber } from 'class-validator';

export class UpdateRolePermissionsRequestDto {
  @ApiProperty()
  @IsNumber()
  roleId: number;

  @ApiProperty({ type: () => [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  permissionIds: number[];
}

export class UpdateUserPermissionOverrideRequestDto {
  @ApiProperty()
  @IsNumber()
  userId: number;

  @ApiProperty()
  @IsNumber()
  permissionId: number;

  @ApiProperty()
  @IsBoolean()
  granted: boolean;
}
