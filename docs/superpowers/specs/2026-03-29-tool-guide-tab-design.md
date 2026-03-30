# Tool Guide Tab — Diseño

**Fecha:** 2026-03-29
**Estado:** Aprobado

---

## Problema

Las herramientas del proyecto (FODA, BMC, 5 Porqués, Persona, Diagnóstico de Industria) no tienen ninguna orientación sobre qué son, cómo se usan o cuándo aplicarlas. Un usuario que nunca usó FODA no sabe cómo completarla ni qué esperar del análisis. Los campos `comoSeUsa`, `ejemplo` y `cuandoUsarlo` del modelo `Tool` existen pero están vacíos.

---

## Solución

Agregar una pestaña **"Guía"** en la página de detalle de herramienta (`tool-application-detail`) que muestre el contenido educativo de la herramienta. Simultáneamente, poblar esos campos en el seed para las 5 herramientas con componente implementado.

---

## Alcance

- **5 herramientas a poblar:** `foda`, `business-model-canvas`, `5-porques`, `persona`, `diagnostico-industria`
- **1 componente nuevo:** `ToolGuideComponent` (standalone, reutilizable)
- **2 archivos modificados:** `tool-application-detail.html` (nuevo tab) + `backend/prisma/seed.ts` (contenido)

---

## Diseño del Tab

### Posición en el tablist

```
[ 📊 {toolLabel} ]  [ 📖 Guía ]  [ ⚙ Detalles ]
```

El tab "Guía" va entre la herramienta y "Detalles". Ícono: `pi-book`. Valor: `"guia"`.

### Contenido: 4 tarjetas visuales

Cada sección es una tarjeta con ícono + título en color primario + texto en gris secundario. Las secciones con campo `null` no se renderizan.

| Sección | Campo DB | Ícono PrimeNG |
|---|---|---|
| ¿Qué es? | `descripcion` | `pi-info-circle` |
| ¿Cómo se usa? | `comoSeUsa` | `pi-list-check` |
| ¿Cuándo usarlo? | `cuandoUsarlo` | `pi-clock` |
| Ejemplo | `ejemplo` | `pi-lightbulb` |

`descripcion` siempre existe → siempre hay al menos una tarjeta visible. No hay empty state: el tab nunca queda vacío.

---

## Componente: ToolGuideComponent

```
frontend/src/app/Pages/platform/phase-detail/tool-application-detail/
└── tool-guide/
    └── tool-guide.component.ts   (standalone, template + styles inline)
```

**Input:** `tool = input.required<ToolResDto>()`

**Secciones renderizadas:**
```typescript
sections = computed(() => [
  { label: '¿Qué es?',      icon: 'pi-info-circle', text: this.tool().descripcion },
  { label: '¿Cómo se usa?', icon: 'pi-list-check',  text: this.tool().comoSeUsa },
  { label: '¿Cuándo usarlo?', icon: 'pi-clock',     text: this.tool().cuandoUsarlo },
  { label: 'Ejemplo',        icon: 'pi-lightbulb',   text: this.tool().ejemplo },
].filter(s => !!s.text));
```

---

## Contenido del Seed

### `foda`

```typescript
comoSeUsa: `Listá en cada cuadrante los factores que corresponden: fortalezas y debilidades son internas al proyecto, oportunidades y amenazas son externas. No necesitás llenarlo todo — con 2 cuadrantes ya podés generar el análisis IA. Agregá ítems concretos y específicos, evitá generalidades.`,

cuandoUsarlo: `Cuando necesitás una foto clara de la situación estratégica antes de tomar decisiones. Ideal al inicio de un proyecto, al evaluar un pivote, o cuando el equipo siente que "algo no está funcionando" pero no sabe exactamente qué.`,

ejemplo: `Un startup de delivery lo usa antes de lanzar: fortalezas (equipo tech propio, precio competitivo), oportunidades (crecimiento del e-commerce local), debilidades (sin marca conocida), amenazas (PedidosYa y Rappi dominando el mercado).`,
```

### `business-model-canvas`

```typescript
comoSeUsa: `Completá los 9 bloques empezando por la Propuesta de Valor — es el centro de todo. Luego definí a quién le llegás (Segmentos y Canales) y cómo generás dinero (Fuentes de Ingreso). Finalmente completá los bloques de operación (Recursos, Actividades, Socios) y costos. No necesitás completar todos para generar el análisis.`,

cuandoUsarlo: `Cuando querés visualizar y comunicar cómo funciona tu modelo de negocio completo en una sola página. Ideal para validar hipótesis de negocio, preparar una presentación a inversores, o detectar incoherencias entre cómo operás y cómo generás valor.`,

ejemplo: `Una app de idiomas: Propuesta de valor (aprendizaje gamificado en 10 minutos diarios), Segmento (adultos 25-40 con poco tiempo), Canal (app store + redes), Ingreso (suscripción mensual), Recursos (tecnología + contenido), Costo (desarrollo y marketing de adquisición).`,
```

### `5-porques`

```typescript
comoSeUsa: `Describí el problema inicial con claridad. Luego respondé "¿por qué ocurre esto?" y usá esa respuesta como punto de partida para el siguiente "¿por qué?". Repetí el proceso hasta llegar a una causa que ya no tenga otro "por qué" detrás — generalmente en 3 a 5 iteraciones.`,

cuandoUsarlo: `Cuando tenés un problema recurrente y las soluciones que probaste no funcionan. También cuando el equipo debate sobre síntomas en lugar de causas reales. No es ideal para problemas complejos con múltiples causas simultáneas — en esos casos combinarlo con un diagrama de Ishikawa.`,

ejemplo: `Problema: "Los usuarios abandonan el checkout". ¿Por qué? → Formulario muy largo. ¿Por qué? → Pedimos datos que no usamos. ¿Por qué? → Nunca cuestionamos el formulario original. ¿Por qué? → No hay proceso de revisión de flujos. Causa raíz: falta de cultura de revisión de UX periódica.`,
```

### `persona`

```typescript
comoSeUsa: `Completá cada sección basándote en datos reales: entrevistas, encuestas, analytics — no en suposiciones. Una persona bien construida tiene tensiones internas (lo que quiere vs. lo que teme) que la hacen creíble. Si no tenés investigación previa, usala como hipótesis inicial para validar.`,

cuandoUsarlo: `Antes de diseñar cualquier solución, cuando el equipo tiene visiones distintas sobre quién es el usuario, o cuando las decisiones de diseño generan debates sin resolución. Una persona compartida da un criterio de decisión común: "¿esto sirve a María?"`,

ejemplo: `María, 34 años, gerente de proyectos en una consultora. Objetivo: terminar su trabajo antes de las 18hs para buscar a sus hijos. Frustración: las herramientas de gestión son lentas y requieren mucha configuración. Comportamiento: usa el celular para todo, prefiere voz a texto cuando puede.`,
```

### `diagnostico-industria`

```typescript
comoSeUsa: `Completá cada fuerza de Porter con observaciones concretas de tu industria — con 2 o 3 puntos por fuerza es suficiente. Podés dejar fuerzas vacías si no tenés información: la IA inferirá del contexto disponible. La sección de Tendencias es opcional pero enriquece mucho el análisis.`,

cuandoUsarlo: `Antes de definir el posicionamiento estratégico, al evaluar si vale la pena entrar a un mercado, o cuando querés entender por qué la competencia está ganando. Ideal en etapas de Exploración o Validación, antes de comprometer recursos significativos.`,

ejemplo: `Una fintech B2B: Rivalidad alta (Mercado Pago y Naranja X dominan), Nuevos entrantes bajos (regulación del BCRA como barrera), Clientes con alto poder (las pymes negocian condiciones), Sustitutos medios (el efectivo sigue siendo competencia). Resultado: industria moderadamente atractiva para nichos desatendidos.`,
```

---

## Archivos a crear/modificar

| Archivo | Acción |
|---|---|
| `frontend/.../tool-guide/tool-guide.component.ts` | Crear |
| `frontend/.../tool-application-detail.html` | Modificar — agregar tab + tabpanel |
| `backend/prisma/seed.ts` | Modificar — agregar contenido a 5 herramientas |

---

## Verificación

1. Correr el seed: `npm run backend:db:seed`
2. Abrir una tool application de tipo FODA → verificar que el tab "Guía" aparece entre la herramienta y "Detalles"
3. Verificar que las 4 secciones se muestran con el contenido correcto
4. Abrir una herramienta sin guía (cualquiera de las otras 62) → verificar el empty state
5. Verificar que `descripcion` siempre se muestra (nunca hay tab vacío)
