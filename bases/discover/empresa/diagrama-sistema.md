# Diagrama de Sistema (System Map)

## 📖 ¿Qué es?

Un **Diagrama de Sistema** (o System Map) es una representación visual que muestra los elementos, relaciones, flujos e interdependencias que conforman un ecosistema o sistema. Es una herramienta fundamental de la teoría de sistemas, desarrollada por pensadores como **Jay Forrester** y **Donella Meadows**, que permite entender la complejidad de un contexto más allá de sus partes individuales.

La diferencia clave entre un diagrama tradicional y un mapa de sistema es que este último busca capturar las **interacciones dinámicas** entre componentes, incluyendo bucles de retroalimentación, puntos de palanca, y flujos de información que no son inmediatamente obvios.

En Design Thinking, el diagrama de sistema se usa para contextualizar el problema dentro de un ecosistema más amplio, identificando stakeholders, flujos de valor, y oportunidades de intervención.

---

## 🔧 Cómo se usa

### Paso a paso:

1. **Define el alcance** — ¿Qué sistema vas a mapear? ¿Dónde están los límites?
2. **Identifica los actores principales** — Personas, organizaciones, sistemas, entidades
3. **Mapea las relaciones** — Conexiones, dependencias, flujos de información
4. **Identifica fronteras** — ¿Qué está dentro del sistema y qué está fuera?
5. **Dibuja flujos** — Inputs, outputs, dinero, información, materiales
6. **Identifica bucles de retroalimentación** — Ciclos que se refuerzan o equilibran
7. **Encuentra puntos de palanca** — Dónde un pequeño cambio tiene gran impacto

### Elementos del diagrama:

| Elemento | Descripción | Ejemplo |
|----------|-------------|---------|
| **Actores** | Entidades que participan | Usuarios, empresas, gobierno |
| **Relaciones** | Conexiones entre actores | Clientela, competencia, regulación |
| **Flujos** | Movimiento de recursos | Dinero, información, productos |
| **Fronteras** | Límites del sistema | Qué incluir y qué excluir |
| **Bucles** | Ciclos de retroalimentación | Refuerzo positivo/negativo |
| **Puntos de palanca** | Dónde interviene para mayor impacto | Políticas, incentivos, tecnología |

### Consejos:

- **Empieza simple** — No intentes capturar todo al inicio
- **Itera** — El diagrama evoluciona con el entendimiento
- **Usa diferentes vistas** — Puedes tener múltiples diagrams para diferentes perspectivas
- **Incluye stakeholders no obvios** — Reguladores, competidores indirectos, medios

---

## 💡 Ejemplo de uso

### Contexto:
Una fintech quiere lanzar un producto de crédito para freelancers. Necesitan entender el ecosistema antes de diseñar.

### Diagrama de sistema creado:

```
                    ┌─────────────────┐
                    │   GOBIERNO      │
                    │ (regulación)    │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
     ┌─────────────────┐ ┌──────────┐ ┌─────────────────┐
     │ BANCOS          │ │ FINTECH  │ │ FONDOS DE       │
     │ (tradicionales) │ │ (nosotros)│ │ INVERSION      │
     └────────┬────────┘ └────┬─────┘ └────────┬────────┘
              │                │                 │
              │                │    ┌────────────┘
              │                ▼
              │        ┌─────────────────┐
              │        │ FREELANCERS    │
              │        │ (nuestro       │
              │        │ segmento)      │
              │        └───────┬────────┘
              │                │
              ▼                ▼
     ┌─────────────────┐ ┌──────────┐
     │ PLATAFORMAS     │ │ CRÉDITO  │
     │ (Upwork, Fiverr)│ │ INFORMAL│
     │ (是我们的)      │ │ (préstamos│
     └─────────────────┘ │ familiares)│
                        └─────────────┘
```

### Análisis derivado:
> **Descubrimiento clave:** Los freelancers dependen mayormente de crédito informal (familiares) porque los bancos no los consideran "cliente objetivo". Las plataformas donde trabajan tienen datos valiosos pero no los comparten.
> 
> **Punto de palanca identificado:** Partner con plataformas como Upwork para acceder a datos de ingresos y ofrecer crédito basado en historial real.
> 
> **Bucle de retroalimentación:** Más freelancers con crédito → más trabajo completado → más ingresos → mejor historial → más crédito disponible.

---

## 📅 Cuándo usarlo

### Fases recomendadas:

- **Discover** — Para mapear el ecosistema y entender el contexto completo
- **Define** — Para validar que el problema está bien enquadrado
- **Develop** — Para verificar que las soluciones consideran todas las interacciones relevantes

### Situaciones ideales:

- ✅ Antes de diseñar soluciones complejas con múltiples stakeholders
- ✅ Para entender relaciones entre actores del mercado
- ✅ Identificar puntos de falla en un sistema
- ✅ En workshops con stakeholders para construir shared understanding
- ✅ Para analizar un problema que parece no tener solución obvious
- ✅ Cuando hay muchas partes implicadas (política, regulación, competencia)

### No usar cuando:

- ❌ El sistema es muy simple (overkill)
- ❌ No tienes suficiente información sobre el contexto
- ❌ Solo necesitas entender una parte específica (usa otra herramienta)

---

## 🛠️ Herramientas digitales

### Para crear diagramas de sistema:

| Herramienta | Descripción | Precio |
|-------------|-------------|--------|
| **Miro** | Pizarra colaborativa con shapes y conectores | Gratis (limitado) |
| **Figma** | Diseño de diagrams integrado | Gratis |
| **draw.io (diagrams.net)** | Editor de diagramas online/offline | Gratis |
| **Lucidchart** | Diagramas profesionales | Prueba gratis |
| **Whimsical** | Diagramas rápidos y minimalistas | Gratis |

### Para diagramas como código (desarrolladores):

| Herramienta | Descripción | Precio |
|-------------|-------------|--------|
| **Mermaid** | Diagramas en Markdown | Gratis |
| **PlantUML** | Diagramas UML textuales | Gratis |
| **Graphviz** | Visualización de grafos | Gratis |

### Para visualizaciones avanzadas:

| Herramienta | Descripción | Precio |
|-------------|-------------|--------|
| **yEd Graph Editor** | Editor gratuito de grafos | Gratis |
| **Gephi** | Análisis de redes complejas | Gratis |

---

## 📚 Recursos adicionales

- [Thinking in Systems - Donella Meadows](https://www.chelseagreen.com/product/thinking-in-systems/)
- [System Dynamics - MIT](https://systemdynamics.mit.edu/)
- [La Guía del System Mapping - Medium](https://medium.com/@jorgegru/system-mapping-guide)

---

> 🐾 Herramienta de Discover > Empresa