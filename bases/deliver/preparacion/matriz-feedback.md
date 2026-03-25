# Matriz de Feedback (Feedback Matrix)

## 📖 ¿Qué es?

La **Matriz de Feedback** es una herramienta que organiza y categoriza los diferentes tipos de feedback que un diseño puede recibir, permitiendo gestionarlos y priorizarlos efectivamente. Es como un inbox inteligente que te ayuda a separar el ruido de las señales importantes.

Sin una matriz de feedback, el feedback puede acumularse sin estructura, y terminas sin saber qué addressar primero. La matriz te fuerza a categorizar cada piece de feedback, lo que hace más fácil ver patrones y tomar decisiones.

Esta herramienta es especialmente útil después de sesiones de testing de usuario o después de presentar a stakeholders, cuando recibes mucho feedback de diferentes fuentes.

---

## 🔧 Cómo se usa

### Estructura de la matriz:

```
                    TIPO DE FEEDBACK
                ┌────────────┬────────────┐
                │  POSITIVO  │  NEGATIVO  │
    ┌───────────┼────────────┼────────────┤
    │  ACERCA   │    ✅      │    ⚠️     │
    │  DEL      │  FEEDBACK │  ISSUES   │
    │  SOLUCIÓN │  A         │  A        │
    │           │  REFORZAR  │  ARREGLAR  │
    ├───────────┼────────────┼────────────┤
    │  ACERCA   │    💡      │    ❌     │
    │  DEL      │  NEW       │  FEEDBACK │
    │  PROBLEMA │  INSIGHTS  │  A        │
    │           │            │  IGNORAR  │
    └───────────┴────────────┴────────────┘
```

### Categorías de feedback:

| Categoría | Tipo | Acción |
|-----------|------|--------|
| **Feedback positivo** | Lo que funciona bien | Reforzar, documentar |
| **Issues críticos** | Problemas que bloquean | Arreglar inmediatamente |
| **Nuevos insights** | Descubrimientos inesperados | Explorar más |
| **Suggestions** | Mejoras sugeridas | Evaluar y priorizar |

### Paso a paso:

1. **Recopilar feedback** — De testing, stakeholders, usuarios
2. **Categorizar** — En la matriz correspondiente
3. **Evaluar** — Es válido? Es accionable?
4. **Priorizar** — Por impacto y urgencia
5. **Asignar** — Quién loaddressa
6. **Seguimiento** — Verificar implementación

### Fuentes de feedback:

| Fuente | Qué aporta |
|--------|------------|
| **Testing de usabilidad** | Problemas de UX |
| **Entrevistas con usuarios** | Necesidades y frustraciones |
| **Analytics y métricas** | Datos de comportamiento |
| **Reviews de stakeholders** | Viabilidad y alignment |
| **Feedback de soporte** | Problemas reales de usuarios |

### Consejos:

- **No ignores el feedback negativo** — Son las oportunidades de mejora
- **Documente el positivo** — Para recordar qué está funcionando
- **Mira patrones** — Un solo comment puede ser anomaly
- **Prioriza por impacto** — No todo tiene igual importancia

---

## 💡 Ejemplo de uso

### Contexto:
Después de un test de usuario con 5 personas, el equipo tiene 23 pieces de feedback. Usan la matriz para organizarlo.

### Matriz completada:

```
MATRIZ DE FEEDBACK - APP DE DELIVERY
═══════════════════════════════════════════════════════════

                    TIPO DE FEEDBACK
                ┌────────────┬────────────┐
                │  POSITIVO  │  NEGATIVO  │
    ┌───────────┼────────────┼────────────┤
    │  ACERCA   │    ✅      │    ⚠️     │
    │  DEL      │  - Botón   │  - Tiempo  │
    │  SOLUCIÓN │    claro   │    entrega │
    │           │  - UI      │   不一致   │
    │           │    limpia  │  - No hay  │
    │           │            │    filtro  │
    │           │            │    vegano  │
    ├───────────┼────────────┼────────────┤
    │  ACERCA   │    💡      │    ❌     │
    │  DEL      │  - Users   │  - Quería  │
    │  PROBLEMA │    want    │    filtro  │
    │           │    más     │    por  │
    │           │    filters │    precio  │
    │           │            │  (ignorar) │
    └───────────┴────────────┴────────────┘
```

### Priorización resultante:

| Feedback | Categoría | Prioridad |
|----------|-----------|-----------|
| Tiempo de entrega inconsistente | Issue crítico | 🟡 Urgente |
| No hay filtro vegano | Issue crítico | 🟡 Urgente |
| Botón claro funciona bien | Positivo | ✅ Mantener |
| UI limpia | Positivo | ✅ Mantener |
| Usuarios quieren más filtros | New insight | 🔵 Planificar |
| Filtro por precio | Ignorar | ❌ No ahora |

### Acción:
> **Prioridad 1:** Agregar filtro vegano antes de siguiente iteración
> **Prioridad 2:** Investigar inconsistencia de tiempo de entrega
> **Prioridad 3:** Planificar más filtros para versión 2

---

## 📅 Cuándo usarlo

### Fases recomendadas:

- **Develop** — Después de testing
- **Deliver** — Después de presentar a stakeholders

### Situaciones ideales:

- ✅ Para organizar feedback después de testing
- ✅ Para comunicar feedback al equipo
- ✅ Para priorizar improvements

### No usar cuando:

- ❌ Tienes muy poco feedback (overkill)
- ❌ El feedback es todo del mismo tipo

---

## 🛠️ Herramientas digitales

### Para crear la matriz:

| Herramienta | Descripción | Precio |
|-------------|-------------|--------|
| **Miro / FigJam** | Pizarra colaborativa | Gratis (limitado) |
| **Notion** | Base de datos | Gratis |
| **Trello** | Tarjetas con labels | Gratis |
| **Airtable** | Matriz completa | Prueba gratis |

### Para tracking de feedback:

| Herramienta | Descripción | Precio |
|-------------|-------------|--------|
| **Jira** | Issue tracking | De pago |
| **Trello** | Project management | Gratis |
| **Linear** | Issue tracking | De pago |

---

## 📚 Recursos adicionales

- [Collecting User Feedback - NN/g](https://www.nngroup.com/articles/collecting-user-feedback/)
- [Feedback Matrix - Service Design Tools](https://servicedesigntools.org/tools/feedback-matrix)
- [Prioritizing Feedback - UX Collective](https://uxdesign.cc/how-to-prioritize-user-feedback)

---

> 🐾 Herramienta de Deliver > Preparación