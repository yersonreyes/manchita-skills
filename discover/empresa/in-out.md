# Diagrama de In/Out (Input-Output)

## 📖 ¿Qué es?

El **Diagrama de In/Out** (también conocido como Diagrama de Input-Output o Mapa de Flujos) es una herramienta simple pero poderosa para definir los límites, flujos y transformaciones de un sistema, producto, servicio o proceso. Muestra qué entra (inputs), cómo se transforma (proceso), y qué sale (outputs).

Esta herramienta es fundamental en la metodología de Design Thinking porque ayuda a entender el contexto del problema sin agregar complejidad innecesaria. Es especialmente útil cuando necesitas entender un sistema existente antes de diseñar una solución, o cuando quieres definir claramente el alcance de un nuevo producto o servicio.

El diagrama se originó en la ingeniería de sistemas y la teoría de procesos, pero se ha adoptado ampliamente en el diseño de productos y servicios porque comunica información compleja de manera visual y accesible.

---

## 🔧 Cómo se usa

### Paso a paso:

1. **Define el sistema** — ¿Qué vas a analizar? Puede ser un proceso, un producto, un servicio, o un flujo completo
2. **Identifica los inputs** — ¿Qué entra al sistema? Incluye recursos, información, materiales
3. **Define el proceso** — ¿Cómo se transforman los inputs en outputs?
4. **Identifica los outputs** — ¿Qué sale del sistema? Productos, servicios, información, desperdicio
5. **Mapea los flujos** — Cómo se conectan las partes
6. **Valida con stakeholders** — Asegúrate de que refleja la realidad

### Tipos de Inputs:

| Tipo | Ejemplos |
|------|----------|
| **Información** | Datos del usuario, requisitos, feedback, preferencias |
| **Recursos** | Dinero, tiempo, personas, conocimiento |
| **Materiales** | Contenido, assets, productos físicos, energía |
| **外部输入** | Regulatorios, competitivos, ambientales |

### Tipos de Outputs:

| Tipo | Ejemplos |
|------|----------|
| **Producto/Servicio** | Lo que entregás al usuario |
| **Datos/Información** | Métricas, analytics, reportes |
| **Feedback/Insights** | Aprendizajes, sugerencias de mejora |
| **Desperdicio** | Lo que se pierde en el proceso |

### Consejos:

- **Sé exhaustivo** — Considera todos los inputs y outputs, no solo los obvios
- **Incluye los "invisibles"** — Datos, información, regulaciones a menudo se ignoran
- **Usa verbos** — Describe los outputs como acciones o resultados
- **Comienza simple** — Luego puedes agregar detalle

---

## 💡 Ejemplo de uso

### Contexto:
Una empresa de SaaS quiere mejorar su proceso de onboarding de nuevos usuarios.

### Diagrama creado:

```
    INPUTS                    PROCESO                     OUTPUTS
    ┌──────────────┐         ┌─────────────────┐        ┌──────────────┐
    │ Usuario      │ ──────→ │                 │ ─────→ │ Usuario      │
    │ registrado   │         │    ONBOARDING   │        │ activo en    │
    │              │         │                 │        │ la plataforma│
    └──────────────┘         │  1. Bienvenida  │        └──────────────┘
                             │  2. Tutorial     │               │
    ┌──────────────┐         │  3. Setup       │        ┌──────────────┐
    │ Datos de     │ ──────→ │  4. Primera     │ ─────→ │ Dashboard    │
    │ empresa      │         │     acción      │        │ personalizado│
    └──────────────┘         │  5. Check-in    │        └──────────────┘
                             └────────┬─────────┘               │
                                      │                   ┌──────────────┐
                                      │ ─────────────────→ │ Datos de    │
                                      │    Métricas        │ uso (telemetría)│
                                      └───────────────────┴──────────────┘
```

### Análisis derivado:
> **Problema identificado:** El proceso actual salta directamente al tutorial sin personalización.
>
> **Insight clave:** Los usuarios que vienen de empresas grandes tienen necesidades diferentes a los independientes. 
>
> **Mejora diseñada:** Agregar un step de "setup" donde se captura el tamaño de empresa y rol, para personalizar el onboarding.

---

## 📅 Cuándo usarlo

### Fases recomendadas:

- **Discover** — Para entender el flujo actual de un sistema o proceso
- **Define** — Para تحديد scope y límites del problema
- **Develop** — Para diseñar nuevos procesos o mejorar existentes

### Situaciones ideales:

- ✅ Para definir el scope de un producto o servicio
- ✅ En análisis de procesos existentes
- ✅ Para identificar gaps o inefficiencies en el sistema
- ✅ Cuando necesitas comunicar cómo funciona algo a stakeholders
- ✅ Para diseñar nuevos flujos de usuario
- ✅ En sesiones de problem framing con el equipo

### No usar cuando:

- ❌ El sistema es muy simple (no justifica el diagrama)
- ❌ Necesitas analizar relaciones complejas entre componentes (usa System Map)
- ❌ Solo necesitas entender una parte del sistema (usa herramientas más específicas)

---

## 🛠️ Herramientas digitales

### Para crear diagramas de flujo:

| Herramienta | Descripción | Precio |
|-------------|-------------|--------|
| **Miro** | Pizarra colaborativa con shapes y conectores | Gratis (limitado) |
| **draw.io (diagrams.net)** | Editor de diagramas online/offline | Gratis |
| **Lucidchart** | Diagramas profesionales | Prueba gratis |
| **Whimsical** | Diagramas rápidos y minimalistas | Gratis |
| **Figma** | Diseño integrado con prototipado | Gratis |
| **Canva** | Plantillas visuales | Gratis |

### Para diagramas como código:

| Herramienta | Descripción | Precio |
|-------------|-------------|--------|
| **Mermaid** | Diagramas en Markdown | Gratis |
| **PlantUML** | Diagramas UML | Gratis |

---

## 📚 Recursos adicionales

- [Input-Output Analysis - Khan Academy](https://www.khanacademy.org/economics-finance-domain/microeconomics/production-technology-cost/marginal-product-revenue/a/inputs-and-outputs)
- [Process Mapping Guide - ASQ](https://asq.org/quality-resources/process-mapping)
- [Diagramas de flujo - Microsoft](https://support.microsoft.com/visio)

---

> 🐾 Herramienta de Discover > Empresa