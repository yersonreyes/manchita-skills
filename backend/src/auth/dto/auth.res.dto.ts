import { ApiProperty } from '@nestjs/swagger';

export class UserAuthDto {
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

export class LoginResponseDto {
  @ApiProperty()
  access_token: string;

  @ApiProperty()
  refresh_token: string;

  @ApiProperty()
  expires_in: string;
}

export class RegisterResponseDto {
  @ApiProperty({ type: () => UserAuthDto })
  res: UserAuthDto;

  @ApiProperty()
  message: string;

  @ApiProperty()
  code: number;
}

export class RefreshTokenResponseDto {
  @ApiProperty()
  access_token: string;

  @ApiProperty()
  refresh_token: string;

  @ApiProperty()
  expires_in: string;
}

export class MessageResponseDto {
  @ApiProperty({ nullable: true })
  res: null;

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
