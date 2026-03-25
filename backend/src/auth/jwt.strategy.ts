import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PermissionService } from 'src/permission/permission.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private permissionService: PermissionService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    // Flujo 1: Super Admin — bypass total de permisos
    if (payload.isSuperAdmin) {
      return { userId: payload.sub, isSuperAdmin: true, permissions: [] };
    }

    // Flujo 2: Usuario regular — cargar permisos actualizados en cada request
    const permissions = await this.permissionService.getUserEffectivePermissions(
      payload.sub,
    );
    return { userId: payload.sub, email: payload.email, permissions };
  }
}
