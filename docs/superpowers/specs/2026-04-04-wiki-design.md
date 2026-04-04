# Wiki por Proyecto — Diseño Técnico

**Fecha:** 2026-04-04  
**Estado:** Aprobado

## Resumen

Agregar un sistema de wiki por proyecto con estructura de páginas anidadas ilimitadas (árbol), editor markdown con toggle a preview, y permisos basados en los roles de proyecto existentes.

---

## 1. Modelo de Datos

Nuevo modelo `WikiPage` en `backend/prisma/schema.prisma`:

```prisma
model WikiPage {
  id          Int      @id @default(autoincrement())
  projectId   Int
  parentId    Int?     // null = página raíz
  titulo      String
  contenido   String   @db.Text
  orden       Int      @default(0)
  activo      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdById Int

  project   Project    @relation(fields: [projectId], references: [id], onDelete: Cascade)
  parent    WikiPage?  @relation("WikiTree", fields: [parentId], references: [id])
  children  WikiPage[] @relation("WikiTree")
  createdBy User       @relation(fields: [createdById], references: [id])

  @@index([projectId])
  @@index([parentId])
}
```

**Nuevos permisos** (agregados al seed):

| Código | Descripción |
|--------|-------------|
| `wiki:read` | Ver páginas de la wiki |
| `wiki:write` | Crear y editar páginas |
| `wiki:delete` | Eliminar páginas (soft delete) |

**Reglas de acceso por rol de proyecto:**

| Rol | wiki:read | wiki:write | wiki:delete |
|-----|-----------|------------|-------------|
| OWNER | ✅ | ✅ | ✅ |
| EDITOR | ✅ | ✅ | ❌ |
| VIEWER | ✅ | ❌ | ❌ |

---

## 2. Backend (NestJS)

**Módulo:** `src/wiki/`

```
src/wiki/
├── wiki.module.ts
├── wiki.controller.ts
├── wiki.service.ts
└── dto/
    ├── create-wiki-page.dto.ts
    ├── update-wiki-page.dto.ts
    └── wiki-page.res.dto.ts
```

**Endpoints:**

| Método | Ruta | Permiso | Descripción |
|--------|------|---------|-------------|
| `GET` | `/wiki/project/:projectId` | `wiki:read` | Lista flat del árbol completo |
| `GET` | `/wiki/:id` | `wiki:read` | Página individual con contenido |
| `POST` | `/wiki` | `wiki:write` | Crear página |
| `PATCH` | `/wiki/:id` | `wiki:write` | Editar título, contenido, orden, parentId |
| `DELETE` | `/wiki/:id` | `wiki:delete` | Soft delete (activo = false) |

**Nota de implementación:** `GET /wiki/project/:projectId` devuelve una lista flat (todos los nodos con su `parentId`). El frontend construye el árbol en memoria. Esto evita queries recursivas en Postgres y simplifica el backend.

---

## 3. Frontend (Angular)

### Rutas

```
/platform/projects/:id/wiki              → redirige a primera página o pantalla vacía
/platform/projects/:id/wiki/:pageId      → página específica
```

Agregadas en `platform.routes.ts` bajo `projects/:id`.

### Estructura de archivos

```
Pages/platform/wiki/
├── wiki.routes.ts
├── wiki-layout/
│   ├── wiki-layout.component.ts        ← shell: sidebar + router-outlet
│   └── wiki-layout.html
├── wiki-sidebar/
│   ├── wiki-sidebar.component.ts       ← árbol de páginas + acciones
│   └── wiki-tree-node.component.ts     ← nodo recursivo individual
└── wiki-page/
    ├── wiki-page.component.ts          ← editor/viewer de página
    └── wiki-page.html
```

### Wiki Layout

Layout de dos columnas:
- **Izquierda** (280px fijo): `WikiSidebarComponent` con árbol y botón "Nueva página"
- **Derecha** (flex): `<router-outlet>` que carga `WikiPageComponent`

### Wiki Sidebar

- Carga el árbol completo del proyecto con `GET /wiki/project/:projectId`
- Convierte la lista flat en árbol en memoria (función utilitaria pura)
- Renderiza `WikiTreeNodeComponent` recursivamente
- Cada nodo: título clicable (navega a la página) + botón inline para agregar subpágina
- Botón "Nueva página raíz" en el header del sidebar

### Wiki Page

- **Modo vista:** contenido markdown renderizado con `ngx-markdown`
- **Modo edición:** `<textarea>` con el markdown crudo + botón "Guardar"
- **Toggle** en el header: botón "Editar" / "Vista previa" que alterna entre modos
- **Título** editable inline (click convierte el `<h1>` en un input)
- Botón "Guardar" visible solo en modo edición y solo para usuarios con `wiki:write`
- Al guardar, vuelve automáticamente a modo vista

### Servicio

`core/services/wikiService/wiki.service.ts` — sigue el patrón `HttpPromiseBuilder` del proyecto.

```typescript
// Métodos expuestos:
getByProject(projectId: number): Promise<WikiPageResDto[]>
getById(id: number): Promise<WikiPageResDto>
create(dto: CreateWikiPageReqDto): Promise<WikiPageResDto>
update(id: number, dto: UpdateWikiPageReqDto): Promise<WikiPageResDto>
delete(id: number): Promise<void>
```

---

## 4. Decisiones técnicas

| Decisión | Razonamiento |
|----------|-------------|
| Contenido en Postgres (`@db.Text`) | Consistente con el resto del proyecto; sin complejidad adicional de S3 |
| Lista flat → árbol en frontend | Evita queries recursivas en Postgres; el frontend tiene el contexto completo del árbol en memoria |
| `ngx-markdown` para el preview | Librería estándar Angular para renderizar markdown |
| Soft delete (`activo = false`) | Consistente con el patrón de todo el proyecto |
| Sin historial de versiones | YAGNI — se puede agregar sobre esta base si se necesita |

---

## 5. Archivos afectados

| Archivo | Cambio |
|---------|--------|
| `backend/prisma/schema.prisma` | Agregar modelo `WikiPage` |
| `backend/prisma/seed.ts` | Agregar permisos `wiki:*` |
| `backend/src/wiki/` | Módulo nuevo completo |
| `backend/src/app.module.ts` | Importar `WikiModule` |
| `frontend/src/app/Pages/platform/wiki/` | Feature completa |
| `frontend/src/app/Pages/platform/platform.routes.ts` | Agregar rutas de wiki |
| `frontend/src/app/core/services/wikiService/` | Servicio nuevo |
