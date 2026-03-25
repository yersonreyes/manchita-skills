# Diseño de Escenarios (Scenario Design)

## 📖 ¿Qué es?

El **Diseño de Escenarios** es una técnica que crea narrativas detalladas sobre cómo un usuario interactúa con un producto o servicio en situaciones específicas. A diferencia de los user flows (que son más técnicos y pasos), los escenarios incluyen el contexto emocional y situacional.

Los escenarios te permiten visualizar y validar soluciones en contextos realistas — no solo "qué hace el usuario" sino "cómo se siente" y "en qué circunstancias". Esto es crucial para diseñar experiencias que funcionen en la vida real.

Esta técnica viene del campo del Service Design y ha sido ampliamente adoptada en UX para crear narrativas que guíen las decisiones de diseño.

---

## 🔧 Cómo se usa

### Estructura de un escenario:

```
DISEÑO DE ESCENARIOS
═══════════════════════════════════════════════════════

├── CONTEXTO
│   ├── Quién es el usuario
│   ├── Dónde está
│   ├── Cuándo usa el producto
│   └── Qué está tratando de lograr

├── FLUJO
│   ├── Paso 1: Acción → reacción del sistema
│   ├── Paso 2: Acción → reacción del sistema
│   └── Resultado final

├── EMOCIONES
│   ├── Qué siente en cada paso
│   └── Dónde se frustra / dónde está satisfecho

└── OPORTUNIDADES
    ├── Dónde podemos ayudar mejor
    └── Dónde fallamos (y cómo mejorar)
```

### Tipos de escenarios:

| Tipo | Descripción | Cuándo usarlo |
|------|-------------|---------------|
| **Happy path** | Flujo ideal, qué sale bien | Para validar que funciona |
| **Edge case** | Situaciones límite | Para casos especiales |
| **Error** | Qué pasa cuando falla | Para manejo de errores |
| **Contextual** | Situaciones específicas (viaje, emergencia) | Para casos reales |
| **Day in the life** | Un día completo del usuario | Para entender contexto amplio |

### Paso a paso:

1. **Identifica el escenario** — qué situación vas a modelar
2. **Define el contexto** — quién, dónde, cuándo, por qué
3. **Escribe el flujo** — pasos que sigue el usuario
4. **Agrega emociones** — cómo se siente en cada paso
5. **Identifica oportunidades** — qué puedes mejorar

### Consejos:

- **Sé específico** — El escenario debe ser realista
- **Incluye emociones** — No solo acciones
- **Usa datos reales** — Basado en investigación
- **Crea múltiples** — Para diferentes situaciones

---

## 💡 Ejemplo de uso

### Contexto:
Un equipo está diseñando el flujo de checkout para una app de delivery. Crean un escenario para validar.

### Escenario creado:

```
ESCENARIO: María pide comida desde el trabajo
═══════════════════════════════════════════════════════

CONTEXTO:
• Usuario: María, 32 años, diseñadora freelance
• Dónde: Oficina de coworking, CDMX
• Cuándo: 7:15pm, después de una giornata larga
• Por qué: Tiene hambre pero no quiere salir a comprar

FLUHO:
1. Abre la app → Ve recomendaciones personalizadas
2. Filtra por "vegano" → Ve opciones disponibles
3. Elige restaurante → Revisa menú y reviews
4. Agrega items al carrito → Ve tiempo estimado (25 min)
5. Paga con Apple Pay → Recibe confirmación instantly
6. Recibe notificación "Tu pedido está en camino"
7. 28 min después → Notificación "Tu pedido llegó"

EMOCIONES:
• Abrir app → Curiosidad ("¿qué hay de nuevo?")
• Filtrar → Alivio ("ok, hay opciones veganas")
• Elegir → Satisfacción ("este looks bien")
• Pagar → Confianza ("rápido y fácil")
• Esperar → Ansiedad ("¿cuánto falta?")
• Recibir → Alegría ("¡por fin!")

OPORTUNIDADES:
✓ Recomendaciones good - mantener personalization
✓ Notifications proactivas - users love being informed
✗ El tiempo estimado varió (dijo 25, llegó en 28)
  → Improve: Ser más preciso o informar el cambio
```

### Análisis derivado:
> **Punto de fricción:** El tiempo estimado no fue preciso, lo que aumentó la ansiedad.
>
> **Mejora:** Notificar proactivamente cuando hay demoras y ofrecer compensaciones.

---

## 📅 Cuándo usarlo

### Fases recomendadas:

- **Develop** — Para validar ideas y flujos
- **Define** — Para entender el contexto

### Situaciones ideales:

- ✅ Para diseñar flujos de usuario
- ✅ Para identificar pain points
- ✅ En prototipado de servicios
- ✅ Para comunicar al equipo cómo se usa el producto

### No usar cuando:

- ❌ Solo necesitas documentar pasos técnicos (usa user flow)
- ❌ El escenario es muy simple

---

## 🛠️ Herramientas digitales

### Para crear escenarios:

| Herramienta | Descripción | Precio |
|-------------|-------------|--------|
| **Miro / FigJam** | Pizarra colaborativa | Gratis (limitado) |
| **Figma** | Diseño visual | Gratis |
| **Canva** | Plantillas | Gratis |
| **Notion** | Documentación | Gratis |

### Para narrativas:

| Herramienta | Descripción | Precio |
|-------------|-------------|--------|
| **StoryThat** | Storytelling para UX | De pago |
| **Storyline Creator** | Crear escenarios | Prueba gratis |

---

## 📚 Recursos adicionales

- [Scenario-Based Design - NN/g](https://www.nngroup.com/articles/scenario-based-design/)
- [Scenarios in Service Design - Service Design Tools](https://servicedesigntools.org/tools/scenario-mapping)
- [UX Storytelling - UX Collective](https://uxdesign.cc/ux-storytelling-guide)

---

> 🐾 Herramienta de Develop > Idear