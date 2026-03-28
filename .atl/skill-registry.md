# Skill Registry — manchita-skills

Auto-resolved by orchestrators and judgment-day. Do NOT edit manually — update the individual SKILL.md files instead.

## User Skills

| Skill | Trigger | Source |
|-------|---------|--------|
| `brainstorming` | Before any feature, component, or behavior creation | `.agents/skills/brainstorming/SKILL.md` |
| `frontend-design` | Building Angular components, pages, or UI layouts (`.ts`, `.html`, `.sass`) | `.agents/skills/frontend-design/SKILL.md` |
| `branch-pr` | Creating a pull request or preparing a branch for review | global |
| `issue-creation` | Creating a GitHub issue (bug report or feature request) | global |
| `judgment-day` | "judgment day", "dual review", "juzgar", adversarial code review | global |
| `sdd-*` | Spec-driven development workflow phases | global |

---

## Project Conventions

- **CLAUDE.md** — Project architecture, module structure, DB schema, frontend patterns
- **backend/PROJECT-PATTERNS-GUIDE.md** — NestJS patterns, DTO conventions, guard usage
- **frontend/GUIA-PROYECTO-BASE.md** — Angular conventions, component patterns, service usage

---

## Compact Rules

### brainstorming

- **HARD GATE**: Do NOT write any code, invoke any skill, or scaffold until the design is presented AND the user approves it.
- Ask clarifying questions ONE AT A TIME. Never bundle multiple questions in one message.
- Propose 2-3 approaches with trade-offs before settling on one.
- Present design in sections scaled to complexity — ask approval after each section.
- Write spec to `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md` after approval.
- Run spec self-review (placeholder scan, internal consistency, scope check, ambiguity check) before showing to user.
- The ONLY skill invoked after brainstorming is `writing-plans`. NEVER call `frontend-design` or `sdd-apply` directly from brainstorming.

---

### frontend-design (manchita-skills)

- Stack: Angular 21 standalone components, PrimeNG 21, TailwindCSS 4, SASS.
- Theme: PrimeNG Aura with custom Emerald preset. Colors defined in `src/app/sass/_colors.sass`.
- Fonts: Syne (headings), Outfit (body) — already loaded in `index.html`. Do NOT add new font imports.
- Use `inject()` for DI — NEVER constructor injection.
- Components MUST be standalone (`standalone: true`). No NgModules.
- Zoneless change detection — always use `signal()`, `computed()`, `effect()` for reactivity. Never use `.subscribe()` for UI state.
- Use `@core/*`, `@pages/*`, `@shared/*` path aliases — never relative `../../` imports across feature boundaries.
- HTTP calls go through `HttpPromiseBuilder` service — never call `HttpClient` directly.
- Global `LoadingWall` component for async loading states. `UiDialogService` for confirmations and toasts.
- Use `HasPermission` directive to hide elements based on user permissions.

---

### branch-pr

- Every PR MUST link an approved issue (`Closes #N`, `Fixes #N`, or `Resolves #N`).
- Branch naming: `type/description` — `^(feat|fix|chore|docs|style|refactor|perf|test|build|ci|revert)\/[a-z0-9._-]+$`
- Commit format: `type(scope): description` — conventional commits only. No `Co-Authored-By` trailers.
- PR MUST have exactly one `type:*` label (type:feature, type:bug, type:docs, type:refactor, type:chore, type:breaking-change).
- PR body must include: `Closes #N`, PR type checkbox, summary (1-3 bullets), changes table, test plan, contributor checklist.
- Automated checks: issue reference, `status:approved` on linked issue, `type:*` label, shellcheck on scripts.

---

### issue-creation

- Blank issues are disabled — MUST use Bug Report or Feature Request template.
- Search existing issues for duplicates before creating.
- Bug Report auto-labels: `bug`, `status:needs-review`. Feature Request auto-labels: `enhancement`, `status:needs-review`.
- A maintainer MUST add `status:approved` before any PR can be opened against the issue.
- Questions go to GitHub Discussions, NOT issues.
- Issue title follows conventional commits format: `fix(scope): description` or `feat(scope): description`.

---

### judgment-day

- Resolve skill registry FIRST (this file) before launching any judge sub-agent.
- Launch Judge A and Judge B IN PARALLEL (async delegates) — never sequential, never one judge.
- Neither judge knows about the other — no cross-contamination.
- Orchestrator synthesizes results: Confirmed (both found it), Suspect A/B (only one found it), Contradiction (agents disagree).
- Fix Agent is a SEPARATE delegation — never use a judge as the fixer.
- Max 2 fix iterations. On third failure → ESCALATED, report to user.
- Inject `## Project Standards (auto-resolved)` block into ALL judge and fix-agent prompts.
- Report `skill_resolution` field: `injected` | `fallback-registry` | `fallback-path` | `none`.

---

### NestJS backend (manchita-skills)

- Global guards applied in order: `JwtAuthGuard` → `PermissionGuard`. Both are in `AppModule` providers.
- Auth decorators from `src/auth/decorators/index.ts`: `@Auth()` (bypass JWT), `@Permission('codigo')` (require permission), `@CurrentUser()` (inject user).
- DTOs are split per module: `*.req.dto.ts` for request, `*.res.dto.ts` for response.
- Always use `PrismaService` via injection — never import Prisma client directly.
- `isSuperAdmin: true` on User bypasses ALL permission checks in `PermissionGuard`.
- Refresh tokens stored as bcrypt hash in `RefreshToken` table — never store raw tokens.
- All new modules must be imported in `AppModule` (`src/app.module.ts`).
- API prefix is `/api` — Swagger at `http://localhost:3000/api/docs`.
