import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { PermissionGuard } from './auth/guards/permission.guard';
import { AiModule } from './ai/ai.module';
import { ToolHubModule } from './tool-hub/tool-hub.module';
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
import { TaskStatusModule } from './task-status/task-status.module';
import { TaskTagModule } from './task-tag/task-tag.module';
import { TaskModule } from './task/task.module';
import { TaskActivityModule } from './task-activity/task-activity.module';
import { WikiModule } from './wiki/wiki.module';

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
    ToolHubModule,

    // ─── Módulos de Dominio ─────────────────────────────────────────────────
    CatalogModule,
    ProjectModule,
    ProjectPhaseModule,
    ToolApplicationModule,
    TaskStatusModule,
    TaskTagModule,
    TaskModule,
    TaskActivityModule,
    WikiModule,
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
