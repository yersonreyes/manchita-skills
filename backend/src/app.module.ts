import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { PermissionGuard } from './auth/guards/permission.guard';
import { AiModule } from './ai/ai.module';
import { AssetsModule } from './assets/assets.module';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { MailModule } from './mail/mail.module';
import { PermissionModule } from './permission/permission.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectModule } from './project/project.module';
import { ProjectPhaseModule } from './project-phase/project-phase.module';
import { ToolApplicationModule } from './tool-application/tool-application.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // ─── Módulos Core ───────────────────────────────────────────────────────
    PrismaModule,
    MailModule,
    PermissionModule,
    AuthModule,
    UserModule,
    AssetsModule,
    AiModule,

    // ─── Módulos de Dominio ─────────────────────────────────────────────────
    CatalogModule,
    ProjectModule,
    ProjectPhaseModule,
    ToolApplicationModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,     // PRIMERO: Autenticar (valida el JWT)
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,  // SEGUNDO: Autorizar (valida los permisos)
    },
  ],
})
export class AppModule {}
