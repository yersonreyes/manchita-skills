# Design: Tool Hub Module — Refactor AI Backend

**Date:** 2026-03-29
**Status:** Approved

---

## Problema

El módulo `ai` actual mezcla dos responsabilidades distintas:

1. **Infraestructura:** conectarse al proveedor de IA (Anthropic, OpenAI, Minimax) a través del factory pattern.
2. **Negocio:** construir system prompts específicos de la herramienta "5 Porqués", cargar datos desde la DB, parsear la respuesta JSON del análisis.

Esta mezcla hace que agregar nuevas herramientas con IA (o con otras APIs) obligue a tocar el módulo de infraestructura, violando el principio de responsabilidad única y dificultando el escalado.

---

## Solución

Separar en dos módulos con responsabilidades claras:

- **`ai`** — infraestructura pura: fachada sobre el proveedor de IA.
- **`tool-hub`** — lógica de negocio: cada herramienta del catálogo tiene sus propios servicios y controller.

---

## Arquitectura de Módulos

```
src/
├── ai/
│   ├── providers/
│   │   ├── ai-provider.interface.ts   (sin cambios)
│   │   ├── ai-provider.factory.ts     (sin cambios)
│   │   ├── anthropic.provider.ts      (sin cambios)
│   │   ├── openai.provider.ts         (sin cambios)
│   │   └── minimax.provider.ts        (sin cambios)
│   ├── dto/
│   │   └── ai-message.dto.ts          (AiMessage — movido desde ai.req.dto)
│   ├── constants/
│   │   └── ai.constants.ts            (sin cambios)
│   ├── ai.service.ts                  (REDUCIDO — solo chat())
│   └── ai.module.ts                   (elimina AiController, exporta AiService)
│
└── tool-hub/
    ├── cinco-porques/
    │   ├── dto/
    │   │   ├── cinco-porques.req.dto.ts
    │   │   └── cinco-porques.res.dto.ts
    │   ├── cinco-porques-chat.service.ts
    │   ├── cinco-porques-analyze.service.ts
    │   └── cinco-porques.controller.ts
    └── tool-hub.module.ts
```

---

## Módulo `ai` (después del refactor)

### `AiService` — API pública reducida

```typescript
chat(
  messages: AiMessage[],
  systemPrompt: string,
  maxTokens?: number
): Promise<string>
```

**Responsabilidades que mantiene:**
- Llamar a `provider.chat()`.
- Logging básico de entrada/salida.
- Validar que el historial no supere 40 mensajes.

**Responsabilidades que pierde (se mueven a `tool-hub`):**
- `buildQuestioner()` — system prompt del 5 Porqués.
- `buildAnalyzer()` — system prompt del analizador.
- `loadToolForApplication()` — consulta a Prisma.
- `extractJson()` — parsing de respuesta del analizador.

### `AiModule` — cambios

- Elimina el registro de `AiController`.
- Elimina la importación de `PrismaModule` (ya no necesita DB).
- Exporta `AiService`.

### `AiController` — eliminado

Ya no tiene endpoints propios. Todas las rutas de IA pasan por `tool-hub`.

---

## Módulo `tool-hub`

### `ToolHubModule`

```typescript
@Module({
  imports: [AiModule, PrismaModule],
  controllers: [CincoPorquesController],
  providers: [CincoPorquesChatService, CincoPorquesAnalyzeService],
})
```

---

### `CincoPorquesController`

| Método | Ruta | Permiso | Handler |
|--------|------|---------|---------|
| POST | `/tool-hub/cinco-porques/chat` | `tool-applications:update` | `CincoPorquesChatService.execute()` |
| POST | `/tool-hub/cinco-porques/analyze` | `tool-applications:update` | `CincoPorquesAnalyzeService.execute()` |

---

### `CincoPorquesChatService`

**Responsabilidad:** ejecutar un turno de conversación guiada con la metodología "5 Porqués".

**Flujo:**
1. Cargar `ToolApplication` + `Tool` desde Prisma usando `toolApplicationId`.
2. Construir el system prompt del questioner usando los datos de la tool.
3. Llamar a `AiService.chat(messages, systemPrompt, 512)`.
4. Calcular `turnCount`.
5. Retornar `{ assistantMessage, turnCount }`.

**DTOs:**
- Request: `{ toolApplicationId: number, userMessage: string, history: AiMessage[] }`
- Response: `{ assistantMessage: string, turnCount: number }`

---

### `CincoPorquesAnalyzeService`

**Responsabilidad:** generar un análisis estructurado al final de una sesión de "5 Porqués".

**Flujo:**
1. Cargar `ToolApplication` + `Tool` desde Prisma usando `toolApplicationId`.
2. Construir el system prompt del analyzer.
3. Formatear el transcript completo de la conversación.
4. Llamar a `AiService.chat([transcript], systemPrompt, 1024)`.
5. Extraer y parsear el JSON de la respuesta.
6. Retornar `{ analysis }`.

**DTOs:**
- Request: `{ toolApplicationId: number, history: AiMessage[] }`
- Response: `{ analysis: { summary, rootCause, insights[], recommendations[] } }`

---

## Frontend — Actualización de URLs

El servicio `frontend/src/app/core/services/aiService/ai.service.ts` actualiza las URLs:

| Antes | Después |
|-------|---------|
| `POST /api/ai/chat` | `POST /api/tool-hub/cinco-porques/chat` |
| `POST /api/ai/analyze` | `POST /api/tool-hub/cinco-porques/analyze` |

Los DTOs de request y response no cambian — el componente `CincoPorquesComponent` del frontend no requiere modificaciones.

---

## Registro en AppModule

`ToolHubModule` se registra en `AppModule` junto al resto de módulos funcionales. `AiModule` permanece registrado como módulo de infraestructura.

---

## Orden de Implementación

1. Crear `tool-hub/` con `ToolHubModule`, `CincoPorquesController`, `CincoPorquesChatService`, `CincoPorquesAnalyzeService` y sus DTOs.
2. Reducir `AiService` — extraer `buildQuestioner`, `buildAnalyzer`, `loadToolForApplication`, `extractJson` a los nuevos services.
3. Eliminar `AiController`.
4. Actualizar `AiModule` — quitar controller y `PrismaModule`.
5. Registrar `ToolHubModule` en `AppModule`.
6. Actualizar `ai.service.ts` del frontend con las nuevas URLs.

---

## Lo que NO cambia

- Providers de IA (Anthropic, OpenAI, Minimax) y su factory.
- DTOs de request/response (misma forma, solo se reubican).
- Lógica de prompts (se mueve, no se reescribe).
- Toda la capa de frontend excepto las URLs en `ai.service.ts`.
- Permisos requeridos en los endpoints.
