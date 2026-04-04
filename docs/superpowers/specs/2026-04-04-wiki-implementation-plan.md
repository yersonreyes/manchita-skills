# Wiki por Proyecto — Plan de Implementación

**Fecha:** 2026-04-04  
**Spec:** `2026-04-04-wiki-design.md`

---

## Orden de implementación

Las tareas siguen este orden de dependencia:

```
DB Schema → Migration → Seed → Backend Module → Frontend Service → Frontend UI
```

---

## Fase 1 — Base de datos

### T1. Agregar modelo `WikiPage` al schema de Prisma

**Archivo:** `backend/prisma/schema.prisma`

Agregar el modelo `WikiPage` con self-referencing `WikiTree`, índices en `projectId` y `parentId`, y relaciones hacia `Project` y `User`.

Agregar en `User` la relación inversa: `wikiPages WikiPage[]`  
Agregar en `Project` la relación inversa: `wikiPages WikiPage[]`

### T2. Crear y correr la migración

```bash
cd backend && npx prisma migrate dev --name add-wiki-pages
```

### T3. Agregar permisos al seed

**Archivo:** `backend/prisma/seed.ts`

Agregar al array de permisos:
- `{ codigo: 'wiki:read', descripcion: 'Ver páginas de la wiki del proyecto' }`
- `{ codigo: 'wiki:write', descripcion: 'Crear y editar páginas de la wiki' }`
- `{ codigo: 'wiki:delete', descripcion: 'Eliminar páginas de la wiki' }`

Asignar `wiki:read` y `wiki:write` al rol `editor` y `wiki:read`, `wiki:write`, `wiki:delete` al rol `admin` en el seed.

```bash
npm run backend:db:seed
```

---

## Fase 2 — Backend (NestJS)

### T4. DTOs

**Archivos a crear:**

`backend/src/wiki/dto/create-wiki-page.dto.ts`
```typescript
// projectId, parentId? (nullable), titulo, contenido, orden?
```

`backend/src/wiki/dto/update-wiki-page.dto.ts`
```typescript
// titulo?, contenido?, orden?, parentId? (todos opcionales con PartialType)
```

`backend/src/wiki/dto/wiki-page.res.dto.ts`
```typescript
// id, projectId, parentId, titulo, contenido, orden, createdAt, updatedAt, createdById
```

### T5. WikiService

**Archivo:** `backend/src/wiki/wiki.service.ts`

Métodos:
- `getByProject(projectId: number): Promise<WikiPage[]>` — lista flat con `where: { projectId, activo: true }`
- `getById(id: number): Promise<WikiPage>` — con NotFoundException si no existe o `activo = false`
- `create(dto, userId): Promise<WikiPage>` — set `createdById` desde el usuario autenticado
- `update(id, dto): Promise<WikiPage>` — PATCH parcial
- `remove(id): Promise<void>` — soft delete (`activo = false`)

### T6. WikiController

**Archivo:** `backend/src/wiki/wiki.controller.ts`

```
GET  /wiki/project/:projectId  → @Permission('wiki:read')
GET  /wiki/:id                 → @Permission('wiki:read')
POST /wiki                     → @Permission('wiki:write')
PATCH /wiki/:id                → @Permission('wiki:write')
DELETE /wiki/:id               → @Permission('wiki:delete')
```

Decoradores: `@ApiBearerAuth`, `@ApiTags('wiki')`, `@CurrentUser()` para obtener userId en create.

### T7. WikiModule + registrar en AppModule

**Archivo nuevo:** `backend/src/wiki/wiki.module.ts`
```typescript
// imports: [PrismaModule], controllers: [WikiController], providers: [WikiService]
```

**Archivo a modificar:** `backend/src/app.module.ts`
```typescript
// Agregar WikiModule al array imports
```

---

## Fase 3 — Frontend Service

### T8. WikiService + DTOs del frontend

**Archivos a crear:**

`frontend/src/app/core/services/wikiService/wiki.dto.ts`
```typescript
export interface WikiPageResDto {
  id: number; projectId: number; parentId: number | null;
  titulo: string; contenido: string; orden: number;
  createdAt: string; updatedAt: string; createdById: number;
}
export interface CreateWikiPageReqDto { projectId: number; parentId?: number | null; titulo: string; contenido: string; orden?: number; }
export interface UpdateWikiPageReqDto { titulo?: string; contenido?: string; orden?: number; parentId?: number | null; }
```

`frontend/src/app/core/services/wikiService/wiki.service.ts`
```typescript
// HttpPromiseBuilder wrapper con los 5 métodos: getByProject, getById, create, update, delete
```

---

## Fase 4 — Frontend UI

### T9. Wiki Types (árbol en memoria)

**Archivo:** `frontend/src/app/Pages/platform/wiki/wiki.types.ts`

```typescript
export interface WikiTreeNode extends WikiPageResDto {
  children: WikiTreeNode[];
}

export function buildTree(pages: WikiPageResDto[]): WikiTreeNode[] {
  // flat list → árbol recursivo
  // 1. Crear map id → node
  // 2. Iterar: si parentId null → raíz, si no → push en children del padre
  // 3. Retornar solo raíces
}
```

### T10. WikiSidebar + WikiTreeNode

**Archivos:**

`frontend/src/app/Pages/platform/wiki/wiki-sidebar/wiki-sidebar.component.ts`
- Inputs: `projectId`, `selectedPageId`
- Carga `getByProject(projectId)` → convierte a árbol con `buildTree()`
- Botón "Nueva página" → abre diálogo/inline para crear raíz
- Renderiza `WikiTreeNodeComponent` recursivo

`frontend/src/app/Pages/platform/wiki/wiki-sidebar/wiki-tree-node.component.ts`
- **CRÍTICO:** importarse a sí mismo en `imports: []` (componente recursivo Angular standalone)
- Inputs: `node: WikiTreeNode`, `selectedPageId`, `level` (para indentación)
- Click en título → navega a `/projects/:id/wiki/:pageId`
- Botón inline "+" → crea subpágina con `parentId = node.id`
- Botón inline "..." → menú: renombrar / eliminar

### T11. WikiPage (editor + viewer)

**Archivo:** `frontend/src/app/Pages/platform/wiki/wiki-page/wiki-page.component.ts`

Estado interno:
- `mode = signal<'view' | 'edit'>('view')`
- `editingTitle = signal(false)`
- `content = signal('')`
- `title = signal('')`
- `saving = signal(false)`

Comportamiento:
- `ngOnInit`: carga la página con `getById(pageId)`, setea `content` y `title`
- `toggleMode()`: alterna entre `view` y `edit`
- En modo `view`: renderizar markdown con `ngx-markdown` → `<markdown [data]="content()" />`
- En modo `edit`: `<textarea [(ngModel)]="content" />` + botón "Guardar"
- Título: `<h1 (click)="editingTitle.set(true)">` → `<input>` cuando `editingTitle()`
- `save()`: llama `update(id, { titulo, contenido })` → vuelve a modo view

Permisos:
- Botón "Editar" solo visible con `*appHasPermission="'wiki:write'"`
- Botón "Guardar" idem

### T12. WikiLayout

**Archivo:** `frontend/src/app/Pages/platform/wiki/wiki-layout/wiki-layout.component.ts`

Layout CSS grid de dos columnas:
- Izquierda: `<app-wiki-sidebar [projectId]="projectId()" [selectedPageId]="pageId()" />`
- Derecha: `<router-outlet />`

Obtiene `projectId` de `ActivatedRoute` snapshot params.

### T13. Rutas de wiki

**Archivo a modificar:** `frontend/src/app/Pages/platform/platform.routes.ts`

```typescript
{
  path: 'projects/:id/wiki',
  loadComponent: () => import('./wiki/wiki-layout/wiki-layout.component').then(m => m.WikiLayoutComponent),
  canActivate: [permissionGuard],
  data: { permissions: ['wiki:read'] },
  children: [
    {
      path: ':pageId',
      loadComponent: () => import('./wiki/wiki-page/wiki-page.component').then(m => m.WikiPageComponent),
    },
    { path: '', redirectTo: 'home', pathMatch: 'full' },  // o primera página
  ],
}
```

### T14. Instalar ngx-markdown

```bash
cd frontend && npm install ngx-markdown marked
```

Agregar `provideMarkdown()` en `app.config.ts`.

### T15. Link a la wiki desde project-detail

**Archivo a modificar:** `frontend/src/app/Pages/platform/project-detail/project-detail.html`

Agregar botón/link que navegue a `/platform/projects/:id/wiki`.

---

## Orden de ejecución recomendado

```
T1 → T2 → T3           (DB)
T4 → T5 → T6 → T7      (Backend — en orden)
T8                      (Frontend service)
T14                     (Instalar dependencia)
T9 → T10 → T11 → T12   (Frontend UI — en orden)
T13 → T15               (Rutas y navegación)
```

---

## Archivos afectados (resumen)

| Archivo | Acción |
|---------|--------|
| `backend/prisma/schema.prisma` | Modificar — agregar WikiPage |
| `backend/prisma/seed.ts` | Modificar — agregar permisos wiki:* |
| `backend/src/wiki/wiki.module.ts` | Crear |
| `backend/src/wiki/wiki.service.ts` | Crear |
| `backend/src/wiki/wiki.controller.ts` | Crear |
| `backend/src/wiki/dto/*.ts` | Crear (3 archivos) |
| `backend/src/app.module.ts` | Modificar — importar WikiModule |
| `frontend/src/app/core/services/wikiService/wiki.dto.ts` | Crear |
| `frontend/src/app/core/services/wikiService/wiki.service.ts` | Crear |
| `frontend/src/app/Pages/platform/wiki/wiki.types.ts` | Crear |
| `frontend/src/app/Pages/platform/wiki/wiki-sidebar/wiki-sidebar.component.ts` | Crear |
| `frontend/src/app/Pages/platform/wiki/wiki-sidebar/wiki-tree-node.component.ts` | Crear |
| `frontend/src/app/Pages/platform/wiki/wiki-page/wiki-page.component.ts` | Crear |
| `frontend/src/app/Pages/platform/wiki/wiki-layout/wiki-layout.component.ts` | Crear |
| `frontend/src/app/Pages/platform/platform.routes.ts` | Modificar — agregar rutas wiki |
| `frontend/src/app/Pages/platform/project-detail/project-detail.html` | Modificar — link a wiki |
| `frontend/src/app/app.config.ts` | Modificar — provideMarkdown() |
