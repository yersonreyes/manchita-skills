# Prototipo Rápido (Rapid Prototype)

## 📖 ¿Qué es?

El **Prototipo Rápido** es una herramienta de diseño que crea representaciones veloces de una idea para obtener feedback inmediato. El objetivo es aprender rápido, fallar barato, e iterar antes de invertir más recursos.

La premisa fundamental es que es más barato aprender ahora que descubrir después que tu solución no funciona. Un prototipo rápido te permite testear hipótesis sin invertir en desarrollo completo.

El prototipado rápido viene de las metodologías ágiles y Lean Startup, donde la velocidad de aprendizaje es más importante que la perfección del producto.

---

## 🔧 Cómo se usa

### Principios del prototipado rápido:

| Principio | Descripción |
|-----------|-------------|
| **Tiempo limitado** | Horas, no días. El prototipo tiene fecha de muerte. |
| **Materiales simples** | Papel, post-its, lo que haya disponible |
| **Iteración rápida** | Versiones sucesivas que mejoran |
| **Feedback inmediato** | Testear lo antes posible, no esperar a tener "todo listo" |
| **Fallar barato** | Mejor fallar en un prototipo de $0 que en desarrollo de $100k |

### Técnicas de prototipado por fidelidad:

| Técnica | Tiempo | Material | Cuándo usarla |
|---------|--------|----------|---------------|
| **Sketch en servilleta** | 2 min | Papel cualquiera | Para ideas rápidas |
| **Paper prototype** | 15 min | Papel, tijeras, post-its | Para flows de UI |
| **Wizard of Oz** | 30 min | Humans simulando el sistema | Para features que no existen |
| **Clickable mockup** | 1-2 hrs | Figma, Adobe XD | Para testing másrealista |
| **MVP code** | 1-2 días | Código básico | Para validación técnica |

### Proceso:

```
1. DEFINIR PREGUNTA   → Qué quiero validar?
                        Ejemplo: "¿Los usuarios entienden este flujo?"

2. CREAR RÁPIDO      → Mínimo necesario para responder la pregunta
                        Ejemplo: Solo el happy path, sin edge cases

3. TESTEAR           → Con usuarios reales (o proxy)
                        Ejemplo: 3-5 usuarios, 15-30 min cada uno

4. APRENDER          → Qué funcionó? Qué no?
                        Ejemplo: El 80% completó el flujo exitosamente

5. ITERAR O PIVOT    → Continuar con la solución o cambiar de enfoque
                        Ejemplo: Iterar el flow para el 20% que falló
```

### Reglas del prototipado rápido:

- **Happy path primero** — Solo el flujo principal
- **Lo justo y necesario** — No sobre-diseñar
- **Baja fidelidad es acceptable** — Funciona para learning
- **Destruible** — No te aferres al prototipo; está para aprendery ser descartado

### Consejos:

- **Define la pregunta primero** — No prototipies sin saber qué vas a aprender
- **No te attaches** — El prototipo no es el producto final
- **Testea antes de que esté "listo"** — "Finished" es relative
- **Documenta los hallazgos** — Lo que aprendes es más valioso que el prototipo

---

## 💡 Ejemplo de uso

### Contexto:
Un equipo quiere validar un nuevo feature de "compras rápidas" en su e-commerce. Tienen 2 días para validar antes de una revisión con stakeholders.

### Prototipo creado:

**Pregunta:** "¿Los usuarios entienden el flujo de compra rápida?"

**Prototipo:** Paper prototype del flujo:
- Pantalla de producto
- Botón "comprar ahora"
- Pantalla de confirmación
- Pantalla de éxito

**Testing:** 5 usuarios, 15 min cada uno

**Hallazgos:**
| Usuario | Resultado | Feedback |
|---------|-----------|----------|
| 1 | ✅ Completó | "Muy fácil" |
| 2 | ✅ Completó | "Me gusta la velocidad" |
| 3 | ❌ No encontró botón | "No vi dónde pagar" |
| 4 | ✅ Completó | "Funciona bien" |
| 5 | ❌ Se confundió | "Pensé que era para miembros" |

**Aprendizaje:** 60% éxito, 40% problemas
- El botón no es visible enough
- La propuesta de valor no está clara

**Iteración:**
- Hacer el botón más prominent
- Agregar texto "Compra en 1-click" para clarify

**Resultado:** En 2 días aprendieron algo que habría tomado semanas descubrir en desarrollo.

---

## 📅 Cuándo usarlo

### Fases recomendadas:

- **Develop** — Para validation velocity

### Situaciones ideales:

- ✅ Para explorar muchas ideas rápido
- ✅ En design sprints
- ✅ Cuando el tiempo es limitado
- ✅ Para validar antes de invertir en desarrollo
- ✅ Para testear ideas risky sin commitment

### No usar cuando:

- ❌ Necesitas testear detalles de UI específicos (usa high-fidelity)
- ❌ La tecnología no existe y no puede ser simulada

---

## 🛠️ Herramientas digitales

### Para prototipado:

| Herramienta | Descripción | Precio |
|-------------|-------------|--------|
| **Figma** | Design y prototipado | Gratis |
| **Adobe XD** | Prototipado profesional | Prueba gratis |
| **Sketch** | Diseño para Mac | Prueba gratis |
| **InVision** | Prototipado y colaboración | Prueba gratis |
| **Balsamiq** | Wireframes rápidos | Prueba gratis |

### Para prototipado físico:

| Material | Uso |
|----------|-----|
| **Papel** | Para sketches y paper prototypes |
| **Post-its** | Para flujos y mejoras |
| **Cartulina** | Para prototipos más elaborados |
| **Tijeras y pegamento** | Para construir |

---

## 📚 Recursos adicionales

- [Prototyping - NN/g](https://www.nngroup.com/articles/prototyping/)
- [Rapid Prototyping - UX Mastery](https://uxmastery.com/rapid-prototyping/)
- [The Lean Startup - Eric Ries](https://theleanstartup.com/)

---

> 🐾 Herramienta de Develop > Prototipar