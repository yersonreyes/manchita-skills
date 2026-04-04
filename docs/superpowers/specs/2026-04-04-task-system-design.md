# Task System Design — Manchita Skills

## Context

Manchita Skills implements the Double Diamond design methodology with a project system (Project > Phase > ToolApplication). Users need a way to manage actionable work within projects — tracking tasks, assigning them to team members, and visualizing progress through multiple views. This design adds a full task management system with Kanban board, list, calendar, timeline (Gantt), and activity history views.

## Decisions

- Tasks live at project level with optional link to ToolApplication
- Free nesting (epic > task > subtask) via self-referencing `parentId`
- Configurable Kanban columns per project (`TaskStatus` model) with 5 default states seeded on project creation
- Permissions based on existing `ProjectMember` roles (OWNER/EDITOR/VIEWER)
- Automatic activity log on every task change (`TaskActivity`)
- All 5 views built with PrimeNG + HTML5 Drag API + CSS Grid (zero new dependencies)
- Shared state across views via Angular signals with computed derivations

## Data Model

### New Enums

```prisma
enum TaskPriority {
  URGENT
  HIGH
  MEDIUM
  LOW
}

enum TaskAction {
  CREATED
  UPDATED
  STATUS_CHANGED
  ASSIGNED
  PRIORITY_CHANGED
  MOVED
  DELETED
}
```

### New Models

```prisma
model TaskStatus {
  id        Int      @id @default(autoincrement())
  projectId Int
  nombre    String
  color     String   // hex color
  orden     Int
  isFinal   Boolean  @default(false)
  activo    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  project Project @relation(fields: [projectId], references: [id])
  tasks   Task[]

  @@unique([projectId, nombre])
}

model Task {
  id                Int           @id @default(autoincrement())
  projectId         Int
  parentId          Int?          // self-relation for nesting
  statusId          Int
  toolApplicationId Int?          // optional link to ToolApplication
  assigneeId        Int?
  createdById       Int
  titulo            String
  descripcion       String?       // rich text (Tiptap)
  prioridad         TaskPriority  @default(MEDIUM)
  fechaInicio       DateTime?
  fechaVencimiento  DateTime?
  fechaCompletado   DateTime?
  estimacion        Float?        // hours
  orden             Int           @default(0) // position in Kanban column
  activo            Boolean       @default(true)
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  project         Project          @relation(fields: [projectId], references: [id])
  parent          Task?            @relation("TaskSubtasks", fields: [parentId], references: [id])
  children        Task[]           @relation("TaskSubtasks")
  status          TaskStatus       @relation(fields: [statusId], references: [id])
  toolApplication ToolApplication? @relation(fields: [toolApplicationId], references: [id])
  assignee        User?            @relation("TaskAssignee", fields: [assigneeId], references: [id])
  createdBy       User             @relation("TaskCreator", fields: [createdById], references: [id])
  tags            TaskTagAssignment[]
  activities      TaskActivity[]
}

model TaskTag {
  id        Int      @id @default(autoincrement())
  projectId Int
  nombre    String
  color     String   // hex color
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  project     Project             @relation(fields: [projectId], references: [id])
  assignments TaskTagAssignment[]

  @@unique([projectId, nombre])
}

model TaskTagAssignment {
  taskId Int
  tagId  Int

  task Task    @relation(fields: [taskId], references: [id])
  tag  TaskTag @relation(fields: [tagId], references: [id])

  @@id([taskId, tagId])
}

model TaskActivity {
  id               Int        @id @default(autoincrement())
  taskId           Int
  userId           Int
  accion           TaskAction
  campoModificado  String?
  valorAnterior    String?
  valorNuevo       String?
  createdAt        DateTime   @default(now())

  task Task @relation(fields: [taskId], references: [id])
  user User @relation(fields: [userId], references: [id])
}
```

### Default TaskStatus Seed (on project creation)

| Nombre | Color | Orden | isFinal |
|--------|-------|-------|---------|
| Backlog | `#6B7280` | 0 | false |
| Por Hacer | `#3B82F6` | 1 | false |
| En Progreso | `#F59E0B` | 2 | false |
| En Revision | `#8B5CF6` | 3 | false |
| Hecho | `#10B981` | 4 | true |

## Backend API

### task-status module (`backend/src/task-status/`)

| Method | Route | Role | Description |
|--------|-------|------|-------------|
| POST | `/task-status/create` | OWNER/EDITOR | Create status |
| GET | `/task-status/project/:projectId` | All | List statuses ordered |
| PATCH | `/task-status/:id` | OWNER/EDITOR | Update name, color, order |
| DELETE | `/task-status/:id` | OWNER | Delete (only if no tasks assigned) |

### task module (`backend/src/task/`)

| Method | Route | Role | Description |
|--------|-------|------|-------------|
| POST | `/task/create` | OWNER/EDITOR | Create task/subtask |
| GET | `/task/project/:projectId` | All | List tasks with filters (status, assignee, priority, tag, dates) |
| GET | `/task/:id` | All | Detail with subtasks, tags, activity |
| PATCH | `/task/:id` | OWNER/EDITOR | Update (auto-generates TaskActivity) |
| PATCH | `/task/:id/move` | OWNER/EDITOR | Change statusId + orden (Kanban drag-drop) |
| PATCH | `/task/:id/reorder` | OWNER/EDITOR | Change orden within same column |
| DELETE | `/task/:id` | OWNER/EDITOR | Soft delete (activo=false) |
| POST | `/task/:id/tags` | OWNER/EDITOR | Assign tag |
| DELETE | `/task/:id/tags/:tagId` | OWNER/EDITOR | Remove tag |

### task-tag module (`backend/src/task-tag/`)

| Method | Route | Role | Description |
|--------|-------|------|-------------|
| POST | `/task-tag/create` | OWNER/EDITOR | Create tag |
| GET | `/task-tag/project/:projectId` | All | List project tags |
| PATCH | `/task-tag/:id` | OWNER/EDITOR | Update name/color |
| DELETE | `/task-tag/:id` | OWNER | Delete tag |

### task-activity module (`backend/src/task-activity/`)

| Method | Route | Role | Description |
|--------|-------|------|-------------|
| GET | `/task-activity/task/:taskId` | All | Task history |
| GET | `/task-activity/project/:projectId` | All | Project-wide history (paginated) |

### Key Backend Logic

- **Auto-activity**: `TaskService.update()` compares old vs new values field-by-field, creates `TaskActivity` records for each change, all within a `prisma.$transaction`
- **Default statuses**: `ProjectService.create()` seeds 5 `TaskStatus` after project creation
- **Subtask counts**: Response DTO includes `_subtaskCount` and `_subtaskCompletedCount` (computed, not stored)
- **Move endpoint**: Recalculates `orden` for affected tasks in both source and destination columns

## Frontend

### Routes

```
/platform/projects/:id/tasks          → redirects to /board
/platform/projects/:id/tasks/board    → Kanban
/platform/projects/:id/tasks/list     → List
/platform/projects/:id/tasks/calendar → Calendar
/platform/projects/:id/tasks/timeline → Timeline (Gantt)
/platform/projects/:id/tasks/activity → Activity History
```

### Components

**`task-views/`** — Container with tab navigation + shared filter toolbar
- Filters: status, assignee, priority, tags, date range
- "New Task" button
- Shared signal state consumed by all child views

**`task-board/`** — Kanban view
- Columns = `TaskStatus` ordered by `orden`
- Cards filtered by `statusId`
- HTML5 Drag API for cross-column and intra-column drag-drop
- Optimistic update with rollback on error

**`task-list/`** — List view
- PrimeNG `TreeTable` with sorting and column filters
- Columns: title (indented for subtasks), status, priority, assignee, due date, tags
- Expand/collapse for subtask hierarchy
- Multi-select for batch actions

**`task-calendar/`** — Calendar view
- CSS Grid: 7 columns (Mon-Sun)
- Month navigation (prev/next)
- Tasks positioned by `fechaVencimiento`
- Task chips colored by status

**`task-timeline/`** — Gantt view
- CSS Grid: rows = tasks, columns = time units
- Horizontal bars from `fechaInicio` to `fechaVencimiento`
- Bar color = priority or status
- Subtasks indented under parent
- Zoom toggle: days / weeks / months

**`task-activity-view/`** — Activity history
- PrimeNG `Timeline` component
- Reverse chronological
- Each entry: user avatar + action description + timestamp
- Paginated (load more)

### Shared Components

**`task-card/`** — Reusable card (used in board and calendar)
- Shows: title, priority chip, assignee avatar, tags, due date, subtask counter

**`task-detail-dialog/`** — Create/edit dialog (sidebar panel)
- Form: title, description (Tiptap), status, priority, assignee, dates, tags, parent task, linked tool
- Inline subtask section
- Activity history section for this task

**`task-filters/`** — Shared filter bar
- Dropdowns + DatePicker
- Signal-based state shared across views

### Services

- `taskService/` — CRUD, move, reorder, tag assignment
- `taskStatusService/` — CRUD Kanban columns
- `taskTagService/` — CRUD tags
- `taskActivityService/` — Read activity logs

All follow existing `HttpPromiseBuilderService` pattern.

### State Management

Signal-based store at `task-views/` level:

```typescript
// Raw data
tasks = signal<Task[]>([]);
statuses = signal<TaskStatus[]>([]);
tags = signal<TaskTag[]>([]);
members = signal<ProjectMember[]>([]);
filters = signal<TaskFilters>({});

// Computed derivations
filteredTasks = computed(() => applyFilters(this.tasks(), this.filters()));
tasksByStatus = computed(() => groupBy(this.filteredTasks(), 'statusId'));
tasksByDate = computed(() => groupBy(this.filteredTasks(), 'fechaVencimiento'));
taskTree = computed(() => buildTree(this.filteredTasks()));
```

### Drag-Drop Flow (Kanban)

1. `dragstart` → capture `taskId` in `dataTransfer`
2. `drop` on target column → calculate new `statusId` + `orden`
3. Optimistic update → mutate signal immediately
4. `PATCH /task/:id/move` → confirm on backend
5. On failure → rollback signal + error toast

## Files to Create/Modify

### Backend (create)
- `backend/src/task-status/task-status.module.ts`
- `backend/src/task-status/task-status.service.ts`
- `backend/src/task-status/task-status.controller.ts`
- `backend/src/task-status/dto/task-status.req.dto.ts`
- `backend/src/task-status/dto/task-status.res.dto.ts`
- `backend/src/task/task.module.ts`
- `backend/src/task/task.service.ts`
- `backend/src/task/task.controller.ts`
- `backend/src/task/dto/task.req.dto.ts`
- `backend/src/task/dto/task.res.dto.ts`
- `backend/src/task-tag/task-tag.module.ts`
- `backend/src/task-tag/task-tag.service.ts`
- `backend/src/task-tag/task-tag.controller.ts`
- `backend/src/task-tag/dto/task-tag.req.dto.ts`
- `backend/src/task-tag/dto/task-tag.res.dto.ts`
- `backend/src/task-activity/task-activity.module.ts`
- `backend/src/task-activity/task-activity.service.ts`
- `backend/src/task-activity/task-activity.controller.ts`
- `backend/src/task-activity/dto/task-activity.res.dto.ts`

### Backend (modify)
- `backend/prisma/schema.prisma` — add new models and enums
- `backend/src/project/project.service.ts` — seed TaskStatus on project creation
- `backend/src/app.module.ts` — register new modules

### Frontend (create)
- `frontend/src/app/core/services/taskService/task.service.ts`
- `frontend/src/app/core/services/taskService/task.req.dto.ts`
- `frontend/src/app/core/services/taskService/task.res.dto.ts`
- `frontend/src/app/core/services/taskStatusService/task-status.service.ts`
- `frontend/src/app/core/services/taskTagService/task-tag.service.ts`
- `frontend/src/app/core/services/taskActivityService/task-activity.service.ts`
- `frontend/src/app/Pages/platform/project-detail/task-views/task-views.component.ts`
- `frontend/src/app/Pages/platform/project-detail/task-views/task-board/task-board.component.ts`
- `frontend/src/app/Pages/platform/project-detail/task-views/task-list/task-list.component.ts`
- `frontend/src/app/Pages/platform/project-detail/task-views/task-calendar/task-calendar.component.ts`
- `frontend/src/app/Pages/platform/project-detail/task-views/task-timeline/task-timeline.component.ts`
- `frontend/src/app/Pages/platform/project-detail/task-views/task-activity-view/task-activity-view.component.ts`
- `frontend/src/app/shared/components/task-card/task-card.component.ts`
- `frontend/src/app/shared/components/task-detail-dialog/task-detail-dialog.component.ts`
- `frontend/src/app/shared/components/task-filters/task-filters.component.ts`

### Frontend (modify)
- `frontend/src/app/Pages/platform/platform.routes.ts` — add task routes
- `frontend/src/app/Pages/platform/project-detail/project-detail.component.ts` — add tasks tab/navigation

## Verification

### Automated Tests

**Backend (Jest):**
- TaskService: create, update, move, soft delete, auto-activity generation
- TaskStatusService: CRUD, prevent deletion with assigned tasks
- TaskTagService: CRUD, unique per project validation
- TaskActivityService: paginated queries, filters

**Frontend (Vitest):**
- TaskStore: filters, computed derivations (tasksByStatus, tasksByDate, taskTree)
- TaskBoard: renders correct columns, drag-drop updates state
- TaskList: TreeTable expand/collapse subtasks
- TaskCalendar: tasks positioned on correct day
- TaskTimeline: bars proportional to duration
- TaskDetailDialog: form validates required fields

**E2E:**
- Create project → 5 default TaskStatus created
- Full CRUD task with nested subtasks
- Move task between columns → TaskActivity generated
- Assign/unassign → TaskActivity generated
- Combined filters (status + assignee + priority + tags + dates)
- Permissions: VIEWER read-only, EDITOR CRUD, OWNER full control

### Manual Verification

1. Create project → board shows 5 default columns
2. Create task from board → appears in correct column
3. Drag task between columns → status updates + activity logged
4. Create subtask → indented in list, counter on parent card
5. Link task to ToolApplication → reference displayed
6. Assign member → avatar on card + activity record
7. Add tags → chips visible across all views
8. Set dates → task appears in calendar and timeline
9. Filter by priority → all views update
10. Configure columns (add/edit/reorder/delete) → board reflects changes
