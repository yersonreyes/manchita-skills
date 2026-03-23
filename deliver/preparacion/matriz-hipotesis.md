# Matriz de Hipótesis

## ¿Qué es?

La Matriz de Hipótesis es una herramienta que organiza y prioriza las hipótesis de diseño en una matriz, permitiendo visualizar cuáles son las más importantes de validar y cuál es el riesgo de cada una.

## Cómo se usa

### Estructura de la matriz:

```
                    IMPACTO POTENCIAL
                   ┌──────────┬──────────┐
                   │  BAJO    │  ALTO     │
        ┌──────────┼──────────┼──────────┤
   ALTO │ HÍPOTESIS│  🏆     │          │
        │  DE      │ PRIORITY│          │
        │ RIESGO   │         │          │
        ├──────────┼──────────┼──────────┤
   BAJO │ HÍPOTESIS│  DROP    │  LATER   │
        │  DE      │          │          │
        │ BAJO     │          │          │
        │ RIESGO   │          │          │
        └──────────┴──────────┴──────────┘
                   INCERTIDUMBRE
```

### Componentes de una hipótesis:

```
HIPÓTESIS: [Si hacemos X], [Entonces Y], [Porque Z]

• X: La solución o cambio que propones
• Y: El resultado esperado
• Z: La razón o insight que sustenta la hipótesis
```

### Criterios de evaluación:

| Criterio | Pregunta |
|----------|----------|
| Impacto | Cuánto valorará el usuario? |
| Incertidumbre | Cuánto sabemos realmente? |
| Riesgo | Cuánto nos costará si fallamos? |
| Facilidad | Cuán fácil es validar? |

### Proceso:

1. **Listar hipótesis** — De learnings y insights
2. **Evaluar cada una** — En los criterios
3. **Posicionar en matriz** — Impacto vs Incertidumbre
4. **Priorizar** — Cuadrante priority primero
5. **Definir experimentos** — Cómo validar cada una

---

> 🐾 Herramienta de Deliver > Preparación
