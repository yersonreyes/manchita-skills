# Diagrama de Sistema (System Map)

## ¿Qué es?

Un diagrama de sistema es una representación visual de los elementos, relaciones y flujos que conforman un ecosistema o sistema. Ayuda a entender la complejidad y las interdependencias entre componentes.

## Cómo se usa

### Elementos básicos:

1. **Actores/Entidades** — Personas, organizaciones, sistemas
2. **Relaciones** — Conexiones entre actores (flujos, dependencias)
3. **Fronteras** — Límites del sistema
4. **Inputs/Outputs** — Entradas y salidas del sistema
5. **Feedback loops** — Ciclos de retroalimentación

### Tipos de diagramas:

```
SISTEMA SIMPLE                  SISTEMA COMPLEJO
                                 
    A → B → C                    A ←→ B
    ↑___________↓                ↑   ↓   ↑
                                 D → E ← F
                                 ↑   ↓   ↓
                                 G ←→ H ←→ I
```

### Herramientas推荐adas:

- **Miro** — Pizarra colaborativa
- **Figma** — Diagramas embebidos
- **Mermaid** — Diagramas como código
- **draw.io** — Diagrama offline

## Cuándo usarlo

- En **Discover** para mapear el ecosistema
- Para entender relationships entre stakeholders
- Antes de diseñar soluciones complejas
- Para identificar puntos de falla

## Ejemplo: Sistema de e-commerce

```
┌──────────┐      ┌──────────┐      ┌──────────┐
│ Usuario  │ ───→ │  App     │ ───→ │ Backend  │
└──────────┘      └──────────┘      └──────────┘
      ↑                │                   │
      │                ↓                   ↓
┌──────────┐      ┌──────────┐      ┌──────────┐
│  Banco   │ ←─── │ Payment  │ ←─── │   DB     │
└──────────┘      └──────────┘      └──────────┘
```

---

> 🐾 Herramienta de Discover
