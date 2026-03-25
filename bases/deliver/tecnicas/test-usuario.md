# Test de Usuario (User Testing)

## 📖 ¿Qué es?

El **Test de Usuario** es una técnica de validación donde usuarios reales interactúan con el diseño (prototipo o producto) mientras el equipo observa, documenta y analiza su comportamiento, reacciones y feedback. Es la forma más directa de descubrir si tu diseño funciona.

La diferencia entre testear y preguntar es fundamental: los usuarios pueden decirte lo que creen que quieres escuchar, pero sus acciones revelan la verdad. El test de usuario te dice exactamente dóndefallan los usuarios.

El test de usuario viene de la disciplina de UX y ha sido refinado por empresas como Apple, Google, y Amazon como la forma definitiva de validar diseños antes de lanzarlos.

---

## 🔧 Cómo se usa

### Tipos de test:

| Tipo | Descripción | Cuándo usarlo |
|------|-------------|---------------|
| **Moderado** | Facilitador guía al usuario | Para exploración profunda |
| **No moderado** | Usuario hace solo, sin guía | Para escala y eficiencia |
| **Remoto** | Online, desde cualquier lugar | Para budget limitado |
| **Presencial** | En persona, laboratorio | Para observación detallada |

### Formatos de ubicación:

| Formato | Descripción | Ventajas |
|---------|-------------|----------|
| **Lab** | En espacio controlado | Máxima observación |
| **Field** | En contexto real del usuario | Contexto auténtico |
| **Remote** | Online via herramienta | Escala geográfica |
| **Guerilla** | En espacios públicos | Feedback rápido |

### Proceso:

```
1. DEFINIR TAREA      → Qué va a hacer el usuario
                       Ejemplo: "Completar el checkout"

2. RECLUTAR          → 5-10 usuarios target
                       Ejemplo: Usuarios que compraron online

3. PREPARAR         → Prototipo, guía, setup
                       Ejemplo: Link de Figma, consentimiento

4. EJECUTAR         → Observar y documentar
                       Ejemplo: Grabación, notas

5. ANALIZAR         → Identificar patrones
                       Ejemplo: 3 de 5 no encontraron el botón

6. ITERAR           → Mejorar el diseño
                       Ejemplo: Hacer el botón más visible
```

### Métricas comunes:

| Métrica | Pregunta que responde |
|---------|----------------------|
| **Tasa de éxito** | ¿El usuario completó la tarea? |
| **Tiempo** | ¿Cuánto tardó? |
| **Errores** | ¿Cuántos errores cometió? |
| **Satisfacción** | ¿Cómo se sintió (SUS score)? |
| **Fallos críticos** | ¿Qué problemas impidieron completar? |

### La regla de oro del test:

> **"No ayudes al usuario. Solo observa."**

Deja que el usuario cometa errores y sefrustre. Esos momentos revelan los problemas reales de tu diseño. Si ayudas, no descubres los problemas.

### Consejos:

- **5 usuarios son suficientes** — Para encontrar la mayoría de problemas
- **Testea temprano y seguido** — No solo al final
- **Observa más que preguntas** — Los acciones > las palabras
- **Documenta todo** — Videos para referencia posterior

---

## 💡 Ejemplo de uso

### Contexto:
Un equipo tiene un nuevo diseño de checkout y quiere validar antes de development.

### Test ejecutado:

**Setup:**
- 5 usuarios (compradores recientes de e-commerce)
- Prototipo en Figma (clickable)
- Tareas:Encontrar producto → Agregar al cart → Checkout → Pagar
- 30 min por usuario

**Hallazgos:**

| Usuario | Tarea 1 | Tarea 2 | Tarea 3 |满意度|
|---------|---------|---------|---------|--------|
| 1 | ✅ | ✅ | ✅ | 4/5 |
| 2 | ✅ | ❌ | ❌ | 2/5 |
| 3 | ✅ | ✅ | ✅ | 5/5 |
| 4 | ✅ | ❌ | ❌ | 2/5 |
| 5 | ✅ | ✅ | ✅ | 4/5 |

**Problemas identificados:**
- 2/5 usuarios no encontraron el código de descuento
- 3/5 usuarios no entendieron el shipping cost
- El tiempo promedio fue 4 min (target: 2 min)

**Output:**
> **Hallazgos clave:** El código de descuento no es visible y el shipping cost aparece tarde. Necesita iterar el diseño antes de development.

**Iteración:**
- Agregar código de descuento en el cart
- Mostrar shipping cost antes del checkout

---

## 📅 Cuándo usarlo

### Fases recomendadas:

- **Develop** — Para validar soluciones
- **Deliver** — Para validar antes de launch

### Situaciones ideales:

- ✅ Para validar prototipos antes de development
- ✅ Para descubrir problemas de usabilidad
- ✅ Para comparar diseños alternativos
- ✅ Para justificar decisiones de diseño

### No usar cuando:

- ❌ El prototipo es muy low-fi para testear
- ❌ No tienes acceso a usuarios target
- ❌ Ya tienes datos de analytics que dicen lo mismo

---

## 🛠️ Herramientas digitales

### Para test remoto:

| Herramienta | Descripción | Precio |
|-------------|-------------|--------|
| **UserTesting** | Testing completo | De pago |
| **Maze** | Testing rápido | Prueba gratis |
| **Lookback** | Testing con video | Prueba gratis |
| **Hotjar** | Session recordings | Prueba gratis |
| **FullStory** | Session recordings | Prueba gratis |

### Para test presencial:

| Herramienta | Descripción | Precio |
|-------------|-------------|--------|
| **Zoom** | Grabación de pantalla | Prueba gratis |
| **UserBob** | Remote testing | De pago |
| **TestingRoom** | Laboratorio de testing | De pago |

### Para análisis:

| Herramienta | Descripción | Precio |
|-------------|-------------|--------|
| **Dovetail** | Análisis de research | Prueba gratis |
| **Optimal Workshop** | Análisis cuantitativo | De pago |

---

## 📚 Recursos adicionales

- [User Testing - NN/g](https://www.nngroup.com/articles/user-testing/)
- [How to Conduct User Tests - Interaction Design](https://www.interaction-design.org/libraries/how_to_conduct_user_tests)
- [The Guide to Usability Testing - UX Collective](https://uxdesign.cc/the-complete-guide-to-usability-testing-2020)

---

> 🐾 Herramienta de Deliver > Técnicas