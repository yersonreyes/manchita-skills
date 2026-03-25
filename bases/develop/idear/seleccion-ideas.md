# Selección de Ideas (Idea Selection)

## 📖 ¿Qué es?

La **Selección de Ideas** es el proceso de evaluar y elegir las mejores ideas generadas para continuar desarrollando. Es el puente crítico entre la fase divergente (generar muchas ideas) y la fase convergente (enfocarse en las mejores).

La selección no se trata de "elegir la mejor idea" — se trata de elegir las ideas correctas para el contexto específico: el problema que resuelves, los recursos que tienes, y el timeline disponible. Una idea que sería perfecta para otra empresa puede no ser la correcta para ti.

Esta fase es donde las ideas se convierten en acciones concretas. Sin ella, corres el riesgo de tentar demasiadas direcciones a la vez o de elegir basándote en intuición en lugar de un framework estructurado.

---

## 🔧 Cómo se usa

### Framework de evaluación:

```
SELECCIÓN DE IDEAS
═══════════════════════════════════════════════════════

Criterios de Evaluación:
├── Impacto en usuario      (1-5)  → ¿Cuánto mejora la experiencia?
├── Viabilidad técnica      (1-5)  → ¿Podemos construirla?
├── Valor de negocio        (1-5)  → ¿Genera valor medible?
├── Facilidad de implementación (1-5) → ¿Qué tan rápido podemosarla?
└── Diferenciación         (1-5)  → ¿Nos diferencia de competidores?
```

### Métodos de selección:

| Método | Cómo funciona | Cuándo usarlo |
|--------|---------------|---------------|
| **Votación simple** | Cada quien vote por sus favoritos | Cuando el equipo es pequeño |
| **Dot voting** | Dots limitados por persona | Para evitar dominancia |
| **Pareto** | 20% de ideas que generan 80% de valor | Cuando hay muchas ideas |
| **Impact vs Effort** | Matriz 2x2 | Para priorización de roadmap |
| **Scorecard** | Puntuación ponderada por criterios | Para decisiones formales |

### Matriz Impacto-Esfuerzo:

```
                    ESFUERZO
                ┌──────────┬──────────┐
                │  BAJO    │  ALTO     │
        ┌───────┼──────────┼──────────┤
   ALTO │QUICK   │  🏆     │           │
        │WIN     │ PRIORITY│           │
        ├────────┼──────────┼──────────┤
   BAJO │  FILL  │  REJECT  │           │
        │  IN    │          │           │
        └────────┴──────────┴──────────┘
```

### Preguntas para evaluar cada idea:

| Pregunta | Por qué importa |
|---------|-----------------|
| ¿Resuelve el problema principal? | Debe address el core problem |
| ¿Es técnicamente posible en timeline? | feasibility |
| ¿El usuario lo va a usar/pagar? | adoption y willingness to pay |
| ¿Tenemos recursos para implementarla? | capacity |
| ¿Se diferencia de la competencia? | competitive advantage |

### Paso a paso:

1. **Reunir todas las ideas** — De la sesión de ideación
2. **Limpiar y agrupar** — Eliminar duplicados, agrupar similares
3. **Aplicar método de selección** — Elegir el más apropiado
4. **Documentar decisiones** — Por qué se eligió cada una
5. **Definir siguiente paso** — Para cada idea seleccionada

### Consejos:

- **No selecciones demasiadas** — 3-5 max para desarrollar
- **Considera el contexto** — Lo que funciona en un momento puede no funcionar en otro
- **Incluye perspectivas diverse** — Producto, diseño, engineering, negocio
- **Sé brutal** — Si una idea no es viable, descártala

---

## 💡 Ejemplo de uso

### Contexto:
Un equipo generó 25 ideas para reducir el abandono en el checkout. Ahora necesitan seleccionar cuáles prototipar.

### Aplicación del método Scorecard:

**Criterios y pesos:**
- Impacto en usuario: 30%
- Viabilidad técnica: 25%
- Valor de negocio: 20%
- Facilidad: 15%
- Diferenciación: 10%

**Ideas evaluadas:**

| Idea | Impacto | Viabilidad | Negocio | Facilidad | Diferenc. | TOTAL |
|------|---------|-------------|---------|-----------|-----------|-------|
| Progress bar | 4 | 5 | 3 | 5 | 2 | 3.7 |
| Guest checkout | 5 | 5 | 4 | 5 | 3 | 4.5 |
| Chat en vivo | 3 | 4 | 2 | 3 | 3 | 3.1 |
| 1-click checkout | 5 | 2 | 5 | 1 | 4 | 3.4 |
| Free shipping | 4 | 4 | 1 | 4 | 2 | 3.2 |

### Selección:

| Prioridad | Idea | Score | Acción |
|-----------|------|-------|--------|
| 1 | Guest checkout | 4.5 | ✅ Prototipar primero |
| 2 | Progress bar | 3.7 | ✅ Prototipar |
| 3 | 1-click | 3.4 | ⏳ Backlog (alta complejidad) |
| 4 | Free shipping | 3.2 | ❌ Requiere cambio de modelo |
| 5 | Chat en vivo | 3.1 | ❌ Bajo impacto vs esfuerzo |

### Output:
> **Decisión:** Priorizar guest checkout y progress bar para el MVP. El 1-click queda en el backlog para fase 2 cuando haya más recursos.

---

## 📅 Cuándo usarlo

### Fases recomendadas:

- **Develop** — Después de idear
- **Entre fases** — Antes de prototipar

### Situaciones ideales:

- ✅ Para reducir scope a lo viable
- ✅ Antes de prototipar
- ✅ Para tomar decisiones de roadmap
- ✅ Cuando hay muchas ideas y necesitas filtrar

### No usar cuando:

- ❌ Solo tienes una idea (no hay selección)
- ❌ Tienes muy pocas opciones (no hay suficiente diversidad)

---

## 🛠️ Herramientas digitales

### Para selección:

| Herramienta | Descripción | Precio |
|-------------|-------------|--------|
| **Miro / FigJam** | Votación colaborativa | Gratis (limitado) |
| **Mural** | Digital whiteboard | Prueba gratis |
| **Trello** | Voting con cards | Gratis |

### Para scoring:

| Herramienta | Descripción | Precio |
|-------------|-------------|--------|
| **Airtable** | Base de datos con scoring | Prueba gratis |
| **Notion** | Tabla de evaluación | Gratis |
| **Google Sheets** | Matriz de scoring | Gratis |

---

## 📚 Recursos adicionales

- [Idea Selection - IDEO](https://www.ideo.org/technique/idea-selection)
- [Prioritization Matrices - MindTools](https://www.mindtools.com/pages/article/newPPM_88.htm)
- [Decision Matrix - ASQ](https://asq.org/quality-resources/decision-matrix)

---

> 🐾 Herramienta de Develop > Idear