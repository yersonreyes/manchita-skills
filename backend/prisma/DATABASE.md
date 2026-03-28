# Base de Datos — Manchita Skills

> PostgreSQL 16 · Prisma ORM · Metodología Double Diamond

---

## Visión general

La base de datos tiene **tres capas bien diferenciadas** que conviven en el mismo schema:

| Capa | Propósito |
|------|-----------|
| **Auth / RBAC** | Usuarios, roles, permisos y tokens |
| **Catálogo** | Las fases y herramientas del Double Diamond (datos maestros) |
| **Proyectos** | El trabajo real: proyectos, fases activas, aplicaciones de herramientas |

---

## Enums

```
ProjectStatus       → DRAFT | IN_PROGRESS | COMPLETED | ARCHIVED
ProjectMemberRole   → OWNER | EDITOR | VIEWER
PhaseStatus         → NOT_STARTED | IN_PROGRESS | COMPLETED
ToolApplicationStatus → PENDING | IN_PROGRESS | COMPLETED
AttachmentType      → IMAGE | PDF | LINK | OTHER
```

---

## Capa 1 — Auth / RBAC

### `User`
El actor central. Toda acción del sistema tiene un usuario detrás.

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | Int PK | autoincrement |
| `email` | String UNIQUE | identificador de login |
| `password` | String | hash bcrypt |
| `nombre` | String | nombre completo |
| `isSuperAdmin` | Boolean | bypass total de permisos |
| `activo` | Boolean | soft delete |

**Relaciones salientes:**
- `userRoles` → roles asignados vía `UserRole`
- `userPermissions` → overrides directos vía `UserPermission`
- `refreshTokens` → sesiones activas vía `RefreshToken`
- `ownedProjects` → proyectos donde es dueño
- `projectMemberships` → proyectos donde participa como miembro
- `toolApplications` → herramientas que creó en proyectos
- `toolAppNotes` → notas que escribió en aplicaciones
- `toolAppAttachments` → adjuntos que subió

---

### `Role`
Agrupador de permisos. Un usuario puede tener múltiples roles.

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | Int PK | |
| `codigo` | String UNIQUE | clave semántica (ej. `admin`) |
| `nombre` | String | nombre legible |
| `descripcion` | Text? | opcional |
| `activo` | Boolean | soft delete |

---

### `Permission`
Unidad atómica de autorización. Se identifica por `codigo` (ej. `user:create`).

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | Int PK | |
| `codigo` | String UNIQUE | clave semántica del permiso |
| `descripcion` | Text? | opcional |
| `activo` | Boolean | soft delete |

---

### `UserRole` *(junction)*
Asigna roles a usuarios. Clave compuesta `(userId, roleId)`.

```
User ←——— UserRole ———→ Role
```

`onDelete: Cascade` en ambas FK → si se borra el usuario o el rol, se limpia automáticamente.

---

### `RolePermission` *(junction)*
Asigna permisos a roles. Clave compuesta `(roleId, permissionId)`.

```
Role ←——— RolePermission ———→ Permission
```

---

### `UserPermission` *(override individual)*
Permite **sobreescribir** un permiso puntual para un usuario específico, independientemente de sus roles.

| Campo | Tipo | Notas |
|-------|------|-------|
| `granted` | Boolean | `true` = permitir · `false` = denegar explícitamente |

> **Lógica de evaluación RBAC:**
> 1. Si `isSuperAdmin` → acceso total, no se evalúa nada más
> 2. Si existe `UserPermission` para ese permiso → usa `granted` (override gana)
> 3. Si no → se acumula de todos los `Role` del usuario vía `RolePermission`

---

### `RefreshToken`
Registro de sesiones activas. El token real **nunca se guarda** — solo su hash.

| Campo | Tipo | Notas |
|-------|------|-------|
| `tokenHash` | String | hash del refresh token |
| `expiresAt` | DateTime | TTL de 7 días |
| `revoked` | Boolean | revocación manual (logout) |

`onDelete: Cascade` → si se borra el usuario, se limpian sus tokens.

---

## Capa 2 — Catálogo (datos maestros)

Son los datos fijos que definen la metodología. **No los crea el usuario final**, los administra el equipo.

### `DesignPhase`
Las 4 fases del Double Diamond: Descubrir, Definir, Desarrollar, Entregar.

| Campo | Tipo | Notas |
|-------|------|-------|
| `codigo` | String UNIQUE | clave semántica (ej. `discover`) |
| `orden` | Int | orden visual de las fases |
| `activo` | Boolean | soft delete |

**Relaciones:**
- `categories` → categorías de herramientas que pertenecen a esta fase
- `projectPhases` → instancias activas en proyectos reales

---

### `ToolCategory`
9 subcategorías que agrupan herramientas dentro de una fase.

| Campo | Tipo | Notas |
|-------|------|-------|
| `phaseId` | FK → DesignPhase | cada categoría pertenece a una sola fase |

```
DesignPhase ←——— ToolCategory ———→ (muchos Tool vía ToolCategoryTool)
```

---

### `Tool`
Las ~67 herramientas de diseño del catálogo. Una herramienta puede pertenecer a **múltiples categorías**.

| Campo | Tipo | Notas |
|-------|------|-------|
| `comoSeUsa` | Text? | instrucciones de uso |
| `ejemplo` | Text? | caso de ejemplo |
| `cuandoUsarlo` | Text? | contexto de aplicación |

---

### `ToolCategoryTool` *(junction)*
Resuelve la relación M2M entre `Tool` y `ToolCategory`. Clave compuesta `(toolId, categoryId)`.

```
Tool ←——— ToolCategoryTool ———→ ToolCategory
```

> Una herramienta como "Mapa de empatía" puede estar en "Investigación" (Descubrir) y en "Síntesis" (Definir) simultáneamente.

---

## Capa 3 — Proyectos (trabajo del usuario)

### `Project`
El contenedor principal del trabajo. Tiene un dueño y un ciclo de vida.

| Campo | Tipo | Notas |
|-------|------|-------|
| `ownerId` | FK → User | creador y responsable |
| `estado` | ProjectStatus | DRAFT → IN_PROGRESS → COMPLETED / ARCHIVED |
| `activo` | Boolean | soft delete |

**Relaciones:**
- `owner` → usuario dueño
- `members` → todos los participantes (incluyendo el owner como OWNER)
- `phases` → fases activas del proyecto

---

### `ProjectMember`
Controla **quién puede hacer qué** dentro de un proyecto.

| Campo | Tipo | Notas |
|-------|------|-------|
| `role` | ProjectMemberRole | OWNER / EDITOR / VIEWER |

Restricción UNIQUE `(projectId, userId)` → un usuario solo puede tener un rol por proyecto.

```
Project ←——— ProjectMember ———→ User
```

---

### `ProjectPhase`
Instancia de una `DesignPhase` dentro de un proyecto concreto. Cuando un usuario activa la fase "Descubrir" en su proyecto, se crea un registro aquí.

| Campo | Tipo | Notas |
|-------|------|-------|
| `phaseId` | FK → DesignPhase | qué fase del catálogo es |
| `estado` | PhaseStatus | progreso de esa fase |
| `orden` | Int | permite reordenar fases en el proyecto |
| `notas` | Text? | anotaciones libres |

Restricción UNIQUE `(projectId, phaseId, orden)` → no se puede duplicar la misma fase en la misma posición.

```
Project ←——— ProjectPhase ———→ DesignPhase
```

---

### `ToolApplication`
El corazón del trabajo: **aplicar una herramienta** en una fase de un proyecto.

| Campo | Tipo | Notas |
|-------|------|-------|
| `projectPhaseId` | FK → ProjectPhase | en qué fase del proyecto |
| `toolId` | FK → Tool | qué herramienta del catálogo |
| `titulo` | String | nombre dado por el usuario |
| `structuredData` | Json | datos propios de la herramienta (flexible) |
| `estado` | ToolApplicationStatus | PENDING → IN_PROGRESS → COMPLETED |
| `createdById` | FK → User | quién la creó |

> `structuredData` es un campo JSON libre que permite que cada herramienta guarde su estructura particular sin necesitar tablas separadas.

---

### `ToolApplicationNote`
Notas colaborativas sobre una aplicación de herramienta.

| Campo | Tipo | Notas |
|-------|------|-------|
| `toolApplicationId` | FK → ToolApplication | a qué aplicación pertenece |
| `contenido` | Text | cuerpo de la nota |
| `createdById` | FK → User | autor |

`onDelete: Cascade` → si se borra la aplicación, se borran sus notas.

---

### `ToolApplicationAttachment`
Archivos, imágenes, PDFs o links adjuntados a una aplicación de herramienta.

| Campo | Tipo | Notas |
|-------|------|-------|
| `url` | String | URL en S3 o link externo |
| `tipo` | AttachmentType | IMAGE / PDF / LINK / OTHER |
| `size` | Int? | tamaño en bytes (opcional) |
| `createdById` | FK → User | quién lo subió |

---

## Diagrama de relaciones

```
                        ┌──────────────┐
                        │   Permission │
                        └──────┬───────┘
                               │ RolePermission (M2M)
                        ┌──────┴───────┐
                        │     Role     │
                        └──────┬───────┘
                               │ UserRole (M2M)
┌──────────────────────────────┼───────────────────────────────┐
│                              │                               │
│                         ┌────┴────┐                         │
│                         │  User   │ ←─── UserPermission      │
│                         └────┬────┘      (override directo)  │
│                              │                               │
│            ┌─────────────────┼──────────────────┐           │
│            │                 │                  │           │
│     RefreshToken      ProjectMember         ownedProjects   │
│                              │                  │           │
└──────────────────────────────┼──────────────────┼───────────┘
                               │                  │
                          ┌────┴────┐    ┌────────┴───────┐
                          │ Project │────│ ProjectPhase   │────→ DesignPhase
                          └─────────┘    └────────┬───────┘          │
                                                  │               ToolCategory
                                         ┌────────┴───────┐          │
                                         │ToolApplication │    ToolCategoryTool
                                         └────────┬───────┘          │
                                                  │               Tool ◄──┘
                                    ┌─────────────┼──────────────┐
                                    │             │              │
                             TAppNote       TAppAttachment    (Tool ref)
```

---

## Convenciones del schema

| Convención | Detalle |
|------------|---------|
| `activo: Boolean` | Soft delete en lugar de borrado físico (User, Role, Permission, DesignPhase, ToolCategory, Tool, Project) |
| `codigo: String UNIQUE` | Clave semántica legible en catálogos y permisos |
| `onDelete: Cascade` | En junctions y relaciones hijo → el padre limpia automáticamente |
| `structuredData: Json` | Campo flexible en ToolApplication para datos variables por herramienta |
| `@@index` | Índices en FKs y campos de filtro frecuente (`activo`, `estado`, `ownerId`) |
