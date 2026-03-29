# Business Model Canvas — Diseño Técnico

**Fecha:** 2026-03-29
**Estado:** Aprobado

---

## Contexto

El BMC existe en el catálogo como `codigo: 'business-model-canvas'` pero no tiene componente frontend ni lógica AI. Se implementa la herramienta completa siguiendo el patrón de Cinco Porqués.

---

## Decisiones de Diseño

| Decisión | Elección |
|----------|----------|
| UI | Split view: canvas visual (40%) + editor de bloque activo (60%) |
| Input | Campos estructurados con preguntas guiadas (3 por bloque) |
| Guardado | Auto-save con debounce 800ms sobre `structuredData` |
| Informe AI | Resumen narrativo + análisis por bloque + coherenceScore + riesgos + recomendaciones |
| Historial | Array `reports[]` en `structuredData`, prepend en cada generación |
| Requisito | 4 bloques obligatorios completos para habilitar generación |

**Bloques requeridos:** `propuestaDeValor`, `segmentosDeClientes`, `fuentesDeIngreso`, `estructuraDeCostos`

---

## structuredData Shape

```typescript
{
  blocks: {
    propuestaDeValor:     { problemasQueResuelve, beneficiosClave, productoServicio },
    segmentosDeClientes:  { clientePrincipal, caracteristicas, necesidadQueResuelves },
    canales:              { comoLlegasAlCliente, etapaDelFunnel, costoEficiencia },
    relacionesConClientes:{ tipoDeRelacion, adquisicion, retencion },
    fuentesDeIngreso:     { comoGenerasIngresos, modeloDePrecio, disposicionAPagar },
    recursosClaves:       { recursosNecesarios, tipoDeRecurso, masCritico },
    actividadesClaves:    { actividadesPrincipales, produccionVsServicio, diferenciadoras },
    asociacionesClaves:   { sociosPrincipales, queTercerizan, motivacion },
    estructuraDeCostos:   { costosPrincipales, costosFijosVsVariables, economiaDeEscala }
  },
  reports: [
    {
      version: number,
      generatedAt: string,  // ISO
      report: {
        executiveSummary: string,
        blockAnalysis: { [blockKey]: { strengths: string[], weaknesses: string[], suggestions: string[] } },
        coherenceScore: number,  // 1-10
        risks: string[],
        recommendations: string[]
      }
    }
  ]
}
```

---

## Arquitectura

### Backend — `backend/src/tool-hub/business-model-canvas/`

| Archivo | Responsabilidad |
|---------|----------------|
| `dto/bmc.req.dto.ts` | `BmcBlockFieldsDto`, `BmcBlocksDto`, `BmcAnalyzeReqDto` |
| `dto/bmc.res.dto.ts` | `BmcBlockAnalysisDto`, `BmcReportDto`, `BmcAnalyzeResDto` |
| `bmc-analyze.service.ts` | Formatea bloques → system prompt → AI → parsea JSON |
| `bmc.controller.ts` | `POST /tool-hub/bmc/analyze` con permiso `tool-applications:update` |

Registrado en `tool-hub.module.ts`.

### Frontend — `tools/business-model-canvas/`

| Componente | Responsabilidad |
|-----------|----------------|
| `bmc.component` | Orquestador: estado signals, auto-save debounce, generateReport() |
| `bmc-canvas.component` | Panel izq: grilla 9 bloques, estado completitud, selector activo |
| `bmc-block-editor.component` | Panel der: 3 campos del bloque activo con labels/placeholders |
| `bmc-report.component` | Vista de informes con selector de versión |

Service: `core/services/bmcService/bmc.service.ts` → `POST /api/tool-hub/bmc/analyze`

---

## Layout del Canvas (CSS Grid)

```
┌─────────────────────────────────────────────────────────┐
│  Socios Clave  │ Actividades │  Propuesta  │ Relaciones │ Segmentos  │
│                ├─────────────┤   de Valor  ├────────────┤            │
│                │  Recursos   │             │  Canales   │            │
├────────────────┴─────────────┴─────────────┴────────────┴────────────┤
│         Estructura de Costos              │    Fuentes de Ingresos   │
└───────────────────────────────────────────────────────────────────────┘
```

---

## Flujo de Generación de Informe

1. Usuario completa ≥1 campo en los 4 bloques requeridos
2. Botón "Generar Informe" se habilita
3. `generateReport()` → `BmcService.analyze({ toolApplicationId, blocks })`
4. Backend: carga tool → formatea 9 bloques como texto → system prompt → AiService.chat (2048 tokens) → parsea JSON
5. Frontend: prepend al array `reports[]` → `ToolApplicationService.update()` → emite `sessionSaved`
6. Navega/muestra el informe generado con todas sus secciones

---

## Verificación

1. Abrir ToolApplication con `tool.codigo === 'business-model-canvas'`
2. Split view carga correctamente
3. Completar campos → auto-save funciona (indicador "Guardado ✓")
4. Con <4 bloques requeridos → botón deshabilitado con tooltip
5. Con 4 requeridos → generar informe → loading state → informe visible con todas secciones
6. Generar segundo informe → historial muestra 2 versiones con selector
7. Recargar → datos y reportes persisten
