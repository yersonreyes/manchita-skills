import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ForgotPasswordRequestDto,
  LoginRequestDto,
  RefreshTokenRequestDto,
  RegisterRequestDto,
  ResetPasswordRequestDto,
} from './dto/auth.req.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  // ─── REGISTER ─────────────────────────────────────────────────────────────
  async register(dto: RegisterRequestDto) {
    const email = dto.email.trim().toLowerCase();
    const nombre = dto.nombre.trim();

    // Verificar si el email ya existe
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException({ message: 'El email ya está registrado', code: 1 });
    }

    const password = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: { email, nombre, password },
    });

    const { password: _, ...userWithoutPassword } = user;

    return {
      res: userWithoutPassword,
      code: 0,
      message: 'Usuario registrado correctamente',
    };
  }

  // ─── LOGIN ────────────────────────────────────────────────────────────────
  async login(dto: LoginRequestDto) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.activo) {
      throw new UnauthorizedException({
        message: 'Credenciales incorrectas',
        code: 1,
      });
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException({
        message: 'Credenciales incorrectas',
        code: 1,
      });
    }

    return this.generateTokenPair(user);
  }

  // ─── REFRESH TOKEN ────────────────────────────────────────────────────────
  async refreshToken(dto: RefreshTokenRequestDto) {
    const tokenHash = crypto
      .createHash('sha256')
      .update(dto.refreshToken)
      .digest('hex');

    const stored = await this.prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!stored) {
      throw new UnauthorizedException({
        message: 'Refresh token inválido o expirado',
        code: 1,
      });
    }

    // Revocar el token actual
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });

    return this.generateTokenPair(stored.user);
  }

  // ─── FORGOT PASSWORD ──────────────────────────────────────────────────────
  async forgotPassword(dto: ForgotPasswordRequestDto) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({ where: { email } });
    // No revelamos si el email existe o no (seguridad)
    if (!user) {
      return {
        res: null,
        code: 0,
        message: 'Si el email existe, recibirás un enlace de recuperación',
      };
    }

    const expiration = this.configService.get('RESET_PASSWORD_TOKEN_EXPIRATION') ?? '1h';
    const token = this.jwtService.sign(
      { sub: user.id, email: user.email, purpose: 'reset-password' },
      { expiresIn: expiration },
    );

    const resetUrl = this.configService.get('PASSWORD_RESET_URL');
    const link = `${resetUrl}?token=${token}`;

    await this.mailService.sendMail({
      to: user.email,
      subject: 'Recuperación de contraseña',
      html: `
        <p>Hola ${user.nombre},</p>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="${link}">${link}</a>
        <p>Este enlace expira en ${expiration}.</p>
        <p>Si no solicitaste este cambio, ignora este correo.</p>
      `,
    });

    return {
      res: null,
      code: 0,
      message: 'Si el email existe, recibirás un enlace de recuperación',
    };
  }

  // ─── RESET PASSWORD ───────────────────────────────────────────────────────
  async resetPassword(dto: ResetPasswordRequestDto) {
    let payload: JwtPayload & { purpose?: string };

    try {
      payload = this.jwtService.verify(dto.token);
    } catch {
      throw new UnauthorizedException({
        message: 'Token inválido o expirado',
        code: 1,
      });
    }

    if (payload.purpose !== 'reset-password') {
      throw new UnauthorizedException({
        message: 'Token inválido',
        code: 1,
      });
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      throw new NotFoundException({ message: 'Usuario no encontrado', code: 1 });
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);

    // Actualizar contraseña y revocar todos los refresh tokens del usuario
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { password: newPasswordHash },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: user.id },
        data: { revoked: true },
      }),
    ]);

    return {
      res: null,
      code: 0,
      message: 'Contraseña restablecida correctamente',
    };
  }

  // ─── HELPER: Generar par de tokens ───────────────────────────────────────
  private async generateTokenPair(user: any) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      permissions: [],
      isSuperAdmin: user.isSuperAdmin,
    };

    const expiresIn = this.configService.get('JWT_EXPIRES_IN') ?? '1h';
    const access_token = this.jwtService.sign(payload, { expiresIn });

    // Generar refresh token aleatorio
    const rawRefreshToken = crypto.randomBytes(64).toString('hex');
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawRefreshToken)
      .digest('hex');

    const daysStr = this.configService.get('REFRESH_TOKEN_EXPIRES_IN_DAYS') ?? '7';
    const days = parseInt(daysStr, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    await this.prisma.refreshToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    return {
      access_token,
      refresh_token: rawRefreshToken,
      expires_in: expiresIn,
    };
  }
}
