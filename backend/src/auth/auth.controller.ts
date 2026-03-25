import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  ForgotPasswordRequestDto,
  LoginRequestDto,
  RefreshTokenRequestDto,
  RegisterRequestDto,
  ResetPasswordRequestDto,
} from './dto/auth.req.dto';
import {
  ErrorResponseDto,
  LoginResponseDto,
  MessageResponseDto,
  RefreshTokenResponseDto,
  RegisterResponseDto,
} from './dto/auth.res.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  // ─── LOGIN ────────────────────────────────────────────────────────────────
  @Post('login')
  @ApiOperation({ summary: 'Inicia sesión y obtiene tokens JWT' })
  @ApiBody({ type: LoginRequestDto })
  @ApiResponse({ status: 200, type: LoginResponseDto })
  @ApiResponse({ status: 401, type: ErrorResponseDto })
  login(@Body() dto: LoginRequestDto) {
    return this.service.login(dto);
  }

  // ─── REGISTER ─────────────────────────────────────────────────────────────
  @Post('register')
  @ApiOperation({ summary: 'Registra un nuevo usuario' })
  @ApiBody({ type: RegisterRequestDto })
  @ApiResponse({ status: 201, type: RegisterResponseDto })
  @ApiResponse({ status: 409, type: ErrorResponseDto })
  register(@Body() dto: RegisterRequestDto) {
    return this.service.register(dto);
  }

  // ─── REFRESH TOKEN ────────────────────────────────────────────────────────
  @Post('refresh')
  @ApiOperation({ summary: 'Refresca el access token usando el refresh token' })
  @ApiBody({ type: RefreshTokenRequestDto })
  @ApiResponse({ status: 200, type: RefreshTokenResponseDto })
  @ApiResponse({ status: 401, type: ErrorResponseDto })
  refreshToken(@Body() dto: RefreshTokenRequestDto) {
    return this.service.refreshToken(dto);
  }

  // ─── FORGOT PASSWORD ──────────────────────────────────────────────────────
  @Post('forgot-password')
  @ApiOperation({ summary: 'Solicita el envío de un enlace de recuperación de contraseña' })
  @ApiBody({ type: ForgotPasswordRequestDto })
  @ApiResponse({ status: 200, type: MessageResponseDto })
  forgotPassword(@Body() dto: ForgotPasswordRequestDto) {
    return this.service.forgotPassword(dto);
  }

  // ─── RESET PASSWORD ───────────────────────────────────────────────────────
  @Post('reset-password')
  @ApiOperation({ summary: 'Restablece la contraseña usando el token de recuperación' })
  @ApiBody({ type: ResetPasswordRequestDto })
  @ApiResponse({ status: 200, type: MessageResponseDto })
  @ApiResponse({ status: 401, type: ErrorResponseDto })
  resetPassword(@Body() dto: ResetPasswordRequestDto) {
    return this.service.resetPassword(dto);
  }
}
