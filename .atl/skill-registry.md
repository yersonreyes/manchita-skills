# Skill Registry — manchita-skills

## User Skills (C:\Users\yerso\.claude\skills\)

| Skill | Trigger |
|-------|---------|
| `sdd-init` | /sdd-init, initialize SDD, iniciar SDD |
| `sdd-explore` | /sdd-explore, explore feature, investigar feature |
| `sdd-propose` | /sdd-propose, create proposal |
| `sdd-spec` | /sdd-spec, write specs |
| `sdd-design` | /sdd-design, write design |
| `sdd-tasks` | /sdd-tasks, task breakdown |
| `sdd-apply` | /sdd-apply, implement tasks |
| `sdd-verify` | /sdd-verify, verify implementation |
| `sdd-archive` | /sdd-archive, archive change |
| `judgment-day` | /judgment-day, adversarial review |
| `go-testing` | Go tests, Bubbletea TUI |
| `skill-creator` | create new skill |
| `branch-pr` | create PR, open pull request |
| `issue-creation` | create GitHub issue |

## Project Conventions

- **CLAUDE.md**: `C:\Users\yerso\Documents\Proyectos\manchita-skills\CLAUDE.md`

## Compact Rules

### Angular Frontend
- Standalone components only (no NgModules)
- Use `inject()` not constructor injection
- Use Signals: `signal()`, `computed()`, `WritableSignal`
- HTTP via `HttpPromiseBuilderService` fluent builder pattern
- Lazy-loaded routes via `loadComponent()` / `loadChildren()`
- Path aliases: `@core/*`, `@pages/*`, `@shared/*`
- Never `constructor(private ...)` — use `private readonly x = inject(X)`
- PrimeNG 21 components + TailwindCSS 4 + SASS for component styles

### NestJS Backend
- Global guards: JwtAuthGuard → PermissionGuard (AppModule)
- Use `@Auth()` for public endpoints
- Use `@Permission('resource:action')` for authorization
- Use `@CurrentUser()` to inject JWT user
- DTOs: class-validator decorators
- Prisma via injected `PrismaService`
- Pattern: Controller → Service → Prisma

### Permissions naming
- Pattern: `resource:action`
- Existing: `users:*`, `permissions:*`, `projects:*`, `project-phases:*`, `tool-applications:*`

### Commits
- Conventional commits only: `feat:`, `fix:`, `refactor:`, `chore:`
- No AI attribution
