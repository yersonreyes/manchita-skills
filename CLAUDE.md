# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Manchita Skills** is a monorepo (npm workspaces) with a NestJS backend and Angular 21 frontend. The app implements the **Double Diamond** design methodology: a catalog of tools organized by design phases and categories, and a project system where users apply those tools to track their design process. It includes JWT authentication and RBAC (Role-Based Access Control).

## Commands

All commands should be run from the **root directory** unless otherwise specified.

### Development
```bash
npm run dev                    # Run backend + frontend concurrently
npm run frontend:start         # Frontend only (ng serve)
npm run backend:dev            # Backend only (watch mode)
```

### Build
```bash
npm run build                  # Backend build
npm run frontend:build         # Frontend development build
npm run frontend:build:prod    # Frontend production build
```

### Testing
```bash
npm run test                   # All tests
npm run backend:test           # Backend Jest tests
npm run backend:test:cov       # With coverage
npm run backend:test:e2e       # E2E tests
npm run frontend:test          # Vitest (run once)
npm run frontend:test:watch    # Vitest watch mode
```

### Linting & Formatting
```bash
npm run backend:lint           # ESLint with auto-fix
npm run backend:format         # Prettier format
npm run frontend:lint          # Angular ESLint
```

### Database
```bash
npm run backend:docker:up      # Start PostgreSQL 16 container
npm run backend:docker:down    # Stop container
npm run backend:docker:reset   # Stop and remove volumes
npm run backend:db:generate    # Generate Prisma client
npm run backend:db:migrate     # Run Prisma migrations
npm run backend:db:seed        # Seed initial data
npm run backend:db:reset       # Reset database
```

## Architecture

### Backend (NestJS 10 + Prisma + PostgreSQL)

**Module structure:** 11 functional domain modules.

| Module | Path | Responsibility |
|--------|------|----------------|
| `prisma` | `src/prisma/` | ORM singleton, global export |
| `mail` | `src/mail/` | Email sending via Nodemailer |
| `assets` | `src/assets/` | File upload/download via AWS S3 |
| `auth` | `src/auth/` | JWT auth, refresh tokens, guards, decorators |
| `user` | `src/user/` | User CRUD |
| `permission` | `src/permission/` | Role and permission management |
| `catalog` | `src/catalog/` | Double Diamond catalog (submódulos abajo) |
| ↳ `design-phase` | `src/catalog/design-phase/` | 4 phases of the Double Diamond |
| ↳ `tool-category` | `src/catalog/tool-category/` | 9 tool subcategories |
| ↳ `tool` | `src/catalog/tool/` | ~67 unique design tools |
| `project` | `src/project/` | Projects with members and roles |
| `project-phase` | `src/project-phase/` | Active phases within a project |
| `tool-application` | `src/tool-application/` | Tool usage in project phases, with notes and attachments |

**Global guards:** `JwtAuthGuard` (authentication) → `PermissionGuard` (authorization) applied globally in `AppModule`.

**Auth decorators** (in `src/auth/decorators/index.ts`):
- `@Auth()` — bypass JWT guard (public endpoints)
- `@Permission('codigo')` — declare required permission
- `@CurrentUser()` — inject user from JWT payload into handler

**Authentication flow:**
- Login returns access token (1h) + refresh token (7 days, stored as hash in `RefreshToken` table)
- Token refresh handled automatically by the frontend interceptor on 401 responses
- Logout revokes refresh tokens in DB

**RBAC model:**
- Users have Roles (many-to-many via `UserRole`)
- Roles have Permissions (many-to-many via `RolePermission`)
- Users can have direct Permission overrides (`UserPermission`, with `granted: boolean` for allow/deny)
- `isSuperAdmin` flag bypasses all permission checks

**API docs:** Swagger UI at `http://localhost:3000/api/docs`

### Frontend (Angular 21 + PrimeNG 21 + TailwindCSS 4)

**Key patterns:**
- All components are **standalone** (no NgModules)
- **Zoneless** change detection (`provideZonelessChangeDetection()`)
- **Lazy-loaded** feature routes: `/auth` (guest-guarded) and `/platform` (auth-guarded)
- Use `inject()` function instead of constructor injection for services

**Directory conventions:**
- `core/` — singleton services, guards, interceptors (loaded once)
- `Pages/` — lazy-loaded feature pages
- `shared/` — reusable components and directives

**Path aliases** (configured in `tsconfig.json`):
- `@core/*` → `src/app/core/*`
- `@pages/*` → `src/app/Pages/*`
- `@shared/*` → `src/app/shared/*`

**Core services:**
- `http-promise-builder.service.ts` — wraps `HttpClient` in a promise-based builder pattern
- `ui-dialog.service.ts` — confirm dialogs and toast notifications
- `authService/auth.service.ts` — login, register, refresh, logout
- `userService/user.service.ts` — user CRUD
- `permissionService/permission.service.ts` — fetch user permissions
- `common/permission-check.service.ts` — permission helper utilities

**Shared:**
- `components/loading-wall/` — full-screen loading overlay
- `directives/has-permission.directive.ts` — hides elements when user lacks a permission

**HTTP interceptors:**
- `auth-token` — attaches `Authorization: Bearer <token>` header
- `auth-refresh` — intercepts 401, calls refresh endpoint, retries original request

**Guards:**
- `auth.guard.ts` — requires authenticated user
- `guest.guard.ts` — requires unauthenticated user (auth routes)
- `permission.guard.ts` — requires specific permission

**Pages:**

`/auth` feature:
- `login/` — login form
- `register/` — register form
- `recover-password/` — request password reset
- `new-password/` — set new password (token-based)

`/platform` feature (protected):
- `profile/` — user profile
- `user-management/` — admin user management
- `role-management/` — admin role management

**UI config:**
- Theme: PrimeNG **Aura** preset with custom Emerald colors (`app.config.ts`)
- Fonts: **Syne** (headings), **Outfit** (body) — loaded in `index.html`
- Locale: Español configured in `app.config.ts`

**Backend API base URL:** `http://localhost:3000/api` (configured in `environments/`)

### Database Schema (Prisma)

Located at `backend/prisma/schema.prisma`.

**Enums:**
- `ProjectStatus` — DRAFT, IN_PROGRESS, COMPLETED, ARCHIVED
- `ProjectMemberRole` — OWNER, EDITOR, VIEWER
- `PhaseStatus` — NOT_STARTED, IN_PROGRESS, COMPLETED
- `ToolApplicationStatus` — PENDING, IN_PROGRESS, COMPLETED
- `AttachmentType` — IMAGE, PDF, LINK, OTHER

**Auth / RBAC models:**
- `User` — email (unique), password (bcrypt), nombre, isSuperAdmin, activo
- `Role` — codigo (unique), nombre, descripcion, activo
- `Permission` — codigo (unique), descripcion, activo
- `UserRole`, `RolePermission` — junction tables
- `UserPermission` — junction with `granted: boolean` for direct overrides
- `RefreshToken` — tokenHash, expiresAt, revoked

**Catalog models:**
- `DesignPhase` — codigo (unique), nombre, descripcion, orden, activo
- `ToolCategory` — codigo (unique), nombre, descripcion, phaseId, activo
- `Tool` — codigo (unique), nombre, descripcion, comoSeUsa, ejemplo, cuandoUsarlo, activo
- `ToolCategoryTool` — M2M junction: Tool ↔ ToolCategory

**Project models:**
- `Project` — nombre, descripcion, estado (ProjectStatus), ownerId, activo
- `ProjectMember` — projectId, userId, role (ProjectMemberRole) — unique: projectId+userId
- `ProjectPhase` — projectId, phaseId, estado (PhaseStatus), orden, notas — unique: projectId+phaseId+orden
- `ToolApplication` — projectPhaseId, toolId, titulo, structuredData (JSON), estado (ToolApplicationStatus), createdById
- `ToolApplicationNote` — toolApplicationId, contenido, createdById
- `ToolApplicationAttachment` — toolApplicationId, nombre, url, tipo (AttachmentType), size, createdById

## Environment Setup

Copy `backend/.env.example` to `backend/.env` and configure:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET`, `JWT_REFRESH_SECRET` — token signing secrets
- SMTP credentials for email service (Nodemailer)
- AWS S3 credentials for file uploads
- `PASSWORD_RESET_URL` — frontend URL for password reset emails

See `SETUP.md` at the root for the full initial setup walkthrough.
