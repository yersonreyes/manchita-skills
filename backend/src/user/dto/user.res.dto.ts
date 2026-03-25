import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  nombre: string;

  @ApiProperty()
  isSuperAdmin: boolean;

  @ApiProperty()
  activo: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class GetAllUsersResponseDto {
  @ApiProperty({ type: () => [UserDto] })
  res: UserDto[];

  @ApiProperty()
  message: string;

  @ApiProperty()
  code: number;
}

export class UserResponseDto {
  @ApiProperty({ type: () => UserDto })
  res: UserDto;

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
