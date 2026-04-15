# Integración de IA en Manchita Skills

> Documento guía para el equipo: qué es el producto, cómo está integrada la IA hoy y cómo podemos seguir sumando análisis automáticos.

---

## 1. ¿Qué es Manchita Skills?

Manchita Skills es una plataforma web (NestJS + Angular 21) que **digitaliza la metodología Double Diamond** para equipos de diseño e innovación.

- **Catálogo**: ~67 herramientas de diseño organizadas en 4 fases — **Discover**, **Define**, **Develop**, **Deliver** — y 9 subcategorías.
- **Proyectos**: los usuarios crean proyectos, activan fases (`ProjectPhase`) y aplican herramientas (`ToolApplication`) para trabajar sobre cada etapa del proceso de diseño.
- **Datos estructurados**: cada `ToolApplication` guarda la info cargada por el usuario en un campo JSON (`structuredData`) con un esquema específico por herramienta (ej: sesiones de Safari, observaciones, entrevistas, ideas, etc.).
- **Autenticación + RBAC** con JWT y permisos granulares.

El valor del producto no está sólo en guardar datos — está en **convertir esos datos en insights accionables**. Ahí entra la IA.

---

## 2. El rol de la IA en el producto

El usuario carga datos estructurados siguiendo la metodología de cada herramienta (observaciones, entrevistas, ideas, patrones…). La IA recibe esos datos **más el contexto del proyecto** y genera un **reporte profesional en JSON** con:

- `executiveSummary` — síntesis ejecutiva
- `patrones`, `painPoints`, `workarounds`, `oportunidades`
- `recommendations` accionables
- Formato específico por herramienta (cada una tiene su DTO de respuesta)

**¿Por qué IA?** Porque los datos etnográficos, de entrevistas o de ideación son **no estructurados en su contenido** (texto libre, observaciones, insights). La IA hace el trabajo de síntesis que antes tomaba horas a un diseñador senior.

---

## 3. Arquitectura de IA actual

Todo el acceso a modelos de IA pasa por **un módulo centralizado** con patrón **Provider + Factory**. Esto permite cambiar de proveedor sin tocar el código de negocio.

```
┌─────────────────────────────────────────────────────────┐
│  *-analyze.service.ts  (1 por herramienta — ~55 hoy)    │
│  • loadContext()                                         │
│  • buildSystemPrompt()                                   │
│  • formatData()                                          │
│  • aiService.chat(...)                                   │
│  • extractJson() + JSON.parse()                          │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  AiService  (backend/src/ai/ai.service.ts)              │
│  chat(messages, systemPrompt, maxTokens) — entrada única │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  IAiProvider  (interfaz)                                 │
│  ai-provider.factory.ts → selecciona por AI_PROVIDER env │
└─────────────────────────────────────────────────────────┘
         │                  │                  │
         ▼                  ▼                  ▼
  AnthropicProvider    OpenAiProvider    MinimaxProvider
   (Claude)             (GPT)             (MiniMax)
```

**Archivos clave:**
- `backend/src/ai/ai.service.ts` — fachada única, loguea proveedor y tamaños.
- `backend/src/ai/providers/ai-provider.interface.ts` — contrato `IAiProvider`.
- `backend/src/ai/providers/ai-provider.factory.ts` — selección por env var.
- `backend/src/ai/providers/anthropic.provider.ts` / `openai.provider.ts` / `minimax.provider.ts`.

> **Ventaja clave**: si mañana Anthropic baja precios o OpenAI saca un modelo mejor, se cambia una env var y listo. Los 55+ analyze services no se enteran.

---

## 4. Patrón de análisis por herramienta

Cada herramienta que usa IA tiene su propio servicio `*-analyze.service.ts` en `backend/src/tool-hub/<herramienta>/`. Todos siguen **el mismo patrón**. Ejemplo canónico: `safari-analyze.service.ts`.

### Flujo en 6 pasos

```ts
async execute(dto: SafariAnalyzeReqDto): Promise<SafariAnalyzeResDto> {
  // 1. Cargar contexto: tool + project desde Prisma
  const { tool, project } = await this.loadContext(dto.toolApplicationId);

  // 2. Armar system prompt (rol, contexto del proyecto, esquema JSON esperado)
  const systemPrompt = this.buildSystemPrompt(tool, project);

  // 3. Serializar los datos estructurados del usuario
  const dataText = this.formatData(dto);

  // 4. Llamada al AiService
  const raw = await this.aiService.chat(
    [{ role: 'user', content: `${dataText}\n\nGenerá el análisis en JSON ahora.` }],
    systemPrompt,
    2048,
  );

  // 5. Extraer y parsear el JSON
  const report = JSON.parse(this.extractJson(raw)) as SafariReportDto;

  // 6. Devolver reporte versionado
  return {
    version: dto.currentVersion + 1,
    generatedAt: new Date().toISOString(),
    report,
  };
}
```

### Helper compartido

`backend/src/tool-hub/shared/project-context.ts` exporta `buildProjectContextSection()` — reutilizado en **todos** los analyze services para inyectar el nombre, descripción y estado del proyecto en el prompt. Mantiene consistencia.

### El system prompt — la pieza más importante

Cada `buildSystemPrompt()`:
1. Define el **rol** del modelo ("Sos un experto en design research…").
2. Inyecta el **contexto de la herramienta** (descripción, cómo se usa).
3. Inyecta el **contexto del proyecto**.
4. Declara la **tarea**.
5. Define el **esquema JSON exacto** de la respuesta.
6. Lista **reglas** (responder sólo JSON, en español, mínimos por sección, priorizar comportamiento real sobre declarado, etc.).

---

## 5. Cómo agregar IA a una herramienta nueva

Checklist de 5 pasos:

1. **DTO request** — `dto/<tool>-analyze.req.dto.ts`: define qué datos estructurados recibe del frontend (tipado, class-validator).
2. **DTO response** — `dto/<tool>-analyze.res.dto.ts`: define la estructura del reporte (el JSON que devuelve la IA). Este es el "contrato" con el frontend.
3. **Analyze service** — `<tool>-analyze.service.ts` copiando el patrón de `safari-analyze.service.ts`:
   - `loadContext()` con `prisma.toolApplication.findUnique({ include: { tool, projectPhase: { include: { project } } } })`
   - `buildSystemPrompt(tool, project)` — usar `buildProjectContextSection()` + esquema JSON específico
   - `formatData(dto)` — serializar datos a texto legible
   - Llamar `aiService.chat(...)` con `maxTokens` razonable (1024–2048)
   - `extractJson()` + `JSON.parse()` + manejar `UnprocessableEntityException`
4. **Controller endpoint** — `<tool>.controller.ts` con `@Post('analyze')`, `@Permission(...)`, inyecta el service.
5. **Frontend** — componente con botón "Generar análisis con IA" que llama al endpoint y renderiza el reporte. Patrón ya establecido en los componentes de `frontend/src/app/Pages/platform/project-*`.

> **Atajo**: existe el skill `manchita-tool-builder` (`~/.claude/skills/manchita-tool-builder/SKILL.md`) que automatiza gran parte de esto leyendo la definición de `bases/`.

---

## 6. Buenas prácticas que ya aplicamos

- **Prompts en español** — el producto es para equipos hispanohablantes, el modelo responde con la voz del producto.
- **JSON estricto** — el modelo SIEMPRE responde un JSON que matchea un DTO tipado. Nada de texto libre en producción.
- **`extractJson()` defensivo** — si el modelo envuelve en ` ```json `, lo parsea igual.
- **Error 422 (`UnprocessableEntityException`)** si el JSON no parsea — el frontend sabe que puede ofrecer "reintentar".
- **Contexto del proyecto inyectado** — cada análisis "sabe" en qué proyecto está trabajando el usuario.
- **Reportes versionados** (`version`, `generatedAt`) — permite guardar histórico y comparar iteraciones.
- **Provider intercambiable** — vendor lock-in cero.
- **Logging centralizado** en `AiService` — sabemos qué proveedor se usa y cuánto responde.

---

## 7. Oportunidades para seguir integrando IA

Cosas que ya existen en el repo y muestran caminos futuros:

- **Chat conversacional** — `role-play-chat.service.ts` ya implementa un chat multi-turno con IA (role play con usuarios simulados). El mismo patrón puede extenderse a "conversá con tus insights".
- **Alertas automáticas** — `income-alert.service.ts` muestra cómo disparar análisis de forma automática (no sólo on-demand).
- **Análisis cruzado entre herramientas** — hoy cada herramienta analiza sus propios datos. Próximo paso: un análisis que tome TODAS las herramientas de una fase y saque conclusiones transversales.
- **Comparación de versiones de reporte** — guardamos `version` y `generatedAt`; podemos mostrar diff entre iteraciones.
- **Sugerencia de siguiente herramienta** — la IA podría recomendar qué herramienta aplicar a continuación en base al estado del proyecto.
- **Extracción desde adjuntos** — los `ToolApplicationAttachment` pueden parsearse con IA (imágenes → texto, PDFs → insights).

---

## 8. Variables de entorno necesarias

En `backend/.env`:

```bash
# Selector de proveedor
AI_PROVIDER=anthropic   # anthropic | openai | minimax

# Anthropic (default)
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-opus-4-6

# OpenAI (opcional)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o

# MiniMax (opcional)
MINIMAX_API_KEY=...
MINIMAX_GROUP_ID=...
MINIMAX_MODEL=...
```

---

## Resumen para presentar al equipo

- Tenemos **una sola puerta de entrada** a la IA (`AiService`) y **55+ servicios de análisis** que la usan.
- El patrón es **claro y replicable**: para una herramienta nueva son 5 archivos siguiendo el modelo de `safari-analyze.service.ts`.
- La arquitectura **no nos casa con ningún proveedor** — cambiamos Anthropic / OpenAI / MiniMax con una env var.
- Lo que diferencia al producto no son los modelos (son commodity) — es **la calidad de los prompts y los esquemas JSON** que diseñamos para cada herramienta del Double Diamond.

**El próximo salto no es agregar más análisis puntuales — es combinar lo que ya analizamos para dar una visión transversal del proyecto.**
