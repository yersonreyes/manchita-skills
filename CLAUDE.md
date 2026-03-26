# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Manchita Skills** is a monorepo (npm workspaces) with a NestJS backend and Angular 21 frontend, implementing a full-stack application with JWT authentication and RBAC (Role-Based Access Control).

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

**Module structure:** Functional domains — `auth`, `user`, `permission`, `mail`, `assets`, `prisma`.

**Global guards:** `JwtAuthGuard` (authentication) → `PermissionGuard` (authorization) applied globally in `AppModule`. Use `@Public()` decorator to bypass auth, `@RequirePermissions()` to declare required permissions.

**Authentication flow:**
- Login returns access token (1h) + refresh token (7 days, stored as hash in `RefreshToken` table)
- Token refresh handled automatically by the frontend interceptor on 401 responses
- Logout revokes refresh tokens in DB

**RBAC model:**
- Users have Roles (many-to-many via `UserRole`)
- Roles have Permissions (many-to-many via `RolePermission`)
- Users can also have direct Permission overrides (many-to-many via `UserPermission`, with `granted: boolean` for allow/deny)
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

**HTTP layer:** `HttpPromiseBuilder` service wraps Angular `HttpClient` in a promise-based builder pattern. Two interceptors:
- `auth-token` — attaches `Authorization: Bearer <token>` header
- `auth-refresh` — intercepts 401, calls refresh endpoint, retries original request

**Backend API base URL:** `http://localhost:3000/api` (configured in `environments/`)

### Database Schema (Prisma)

Located at `backend/prisma/schema.prisma`. Core models:
- `User` — email (unique), password (hashed bcrypt), nombre, isSuperAdmin, activo
- `Role` — codigo (unique), nombre, descripcion, activo
- `Permission` — codigo (unique), descripcion, activo
- `UserRole`, `RolePermission` — junction tables
- `UserPermission` — junction with `granted: boolean` for direct overrides
- `RefreshToken` — tokenHash, expiresAt, revoked

## Environment Setup

Copy `backend/.env.example` to `backend/.env` and configure:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET`, `JWT_REFRESH_SECRET` — token signing secrets
- SMTP credentials for email service (Nodemailer)
- AWS S3 credentials for file uploads
- `PASSWORD_RESET_URL` — frontend URL for password reset emails

See `SETUP.md` at the root for the full initial setup walkthrough.
