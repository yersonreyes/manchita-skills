# User Persona (Persona de Usuario)

## 📖 ¿Qué es?

Una **User Persona** es una representación arquetípica de un usuario objetivo, basada en datos reales de investigación. Es un personaje ficticio pero fundamentado que ayuda a todo el equipo a tomar decisiones de diseño centrado en el usuario.

Las Personas fueron popularizadas por **Alan Cooper** en su libro "The Inmates Are Running the Asylum" (1999) y se han convertido en una de las herramientas más fundamentales del Design Thinking y UX Design.

La clave de una buena persona es que no es inventada — es una síntesis de datos reales de usuarios. Una persona bien construida te permite responder: "¿Qué haría [Nombre] en esta situación?" y tomar decisiones basadas en ese contexto.

---

## 🔧 Cómo se usa

### Paso a paso:

1. **Recopila datos de investigación** — Entrevistas, encuestas, analytics
2. **Identifica patrones** — Busca segmentos naturales en los datos
3. **Construye el perfil** — Llena cada sección con información específica
4. **Añade detalles humanos** — Frases, motivaciones, frustraciones
5. **Valida con el equipo** — Asegúrate de que resuena con todos
6. **Úsala en decisiones** — Consulta la persona en cada decisión de diseño

### Componentes de una Persona:

| Sección | Qué incluir |
|---------|--------------|
| **Nombre y foto** | Nombre memorable, foto representativa |
| **Demográficos** | Edad, profesión, ubicación, ingresos |
| **Biografía/Historia** | Contexto personal y profesional |
| **Motivaciones** | Qué quiere lograr, por qué le importa |
| **Frustraciones/Pain Points** | Qué le frustra, barreras que enfrenta |
| **Comportamiento** | Cómo usa tecnología, canales preferidos |
| **Citación** | Quote representativo del usuario real |
| **Frustraciones y Goals** | goals claros y específicos |

### Tipos de Personas:

| Tipo | Descripción | Uso |
|------|-------------|-----|
| **Primary** | Usuario principal, el más importante | Diseñar para esta persona |
| **Secondary** | Usuario secundario, importante pero no principal | Considerar en el diseño |
| **Adverse** | A quien NO sirve el producto/servicio | Evitar diseñar para esta |
| **Stakeholder** | Usuarios de negocio (internal) | Considerar en decisiones de negocio |

### Consejos:

- **Usa datos reales, no suposiciones** — La persona se basa en investigación
- **Sé específico** — "María, 32 años, diseñadora en CDMX" > "usuario millennial"
- **Una persona por escenario** — No una para todo el producto
- **Incluye una cita real** — De las entrevistas, para hacerlo humano
- **No más de 3-4 por producto** — Demasiadas personas = parálisis

---

## 💡 Ejemplo de uso

### Contexto:
Una fintech está diseñando una app de inversiones para millennials en México.

### Persona creada:

```
┌─────────────────────────────────────────────────────────────┐
│                    MARÍA, LA INVERSORA CUIDADOSA            │
│              [Foto: Mujer de 30 años, mirada amable]         │
├─────────────────────────────────────────────────────────────┤
│  DEMOGRAFICOS                                                │
│  • Edad: 32 años                                             │
│  • Profesión: Diseñadora UX en empresa de tech             │
│  • Ubicación: Ciudad de México                              │
│  • Ingresos: $25,000-35,000 MXN/mes                         │
│  • Estado civil: Soltera, vive con roommates                │
├─────────────────────────────────────────────────────────────┤
│  BIO / HISTORIA                                              │
│  María trabaja como diseñadora UX en una startup de         │
│  e-commerce. Gana bien pero no sabe nada de finanzas.       |
│  Tiene ahorros en cuenta de Nomina (casi no genera interés) │
│  y le preocupa no tener un plan de retiro.                  │
├─────────────────────────────────────────────────────────────┤
│  METAS / MOTIVACIONES                                       │
│  • Sentir que sus ahorros "están trabajando"                │
│  • No perder dinero (prioridad #1)                           │
│  • Entender qué está pasando con su dinero                  │
│  • Preparar un fondo de emergencia de 6 meses                │
├─────────────────────────────────────────────────────────────┤
│  FRUSTRACIONES / PAIN POINTS                                │
│  • Todo parece muy complicado y con jerga financiera         │
│  • Le da miedo invertir porque "no entiende"                 │
│  • No tiene tiempo de aprender                             │
│  • Le frustran los mínimos de inversión altos                │
├─────────────────────────────────────────────────────────────┤
│  COMPORTAMIENTO                                              │
│  • Heavy user de Instagram y TikTok para aprender            │
│  • Prefiere aprender con videos cortos, no texto             │
│  • Usa su teléfono para todo                                 │
│  • Confía más en recomendaciones de amigos que en expertos   │
├─────────────────────────────────────────────────────────────┤
│  "QUOTE"                                                     │
│  "Sé que debería invertir, pero me da miedo perder           │
│  lo poco que tengo. Necesito algo que me explique           │
│  en palabras simples qué está pasando con mi dinero."       │
└─────────────────────────────────────────────────────────────┘
```

### Uso en decisiones de diseño:

| Decisión | Pregunta desde la persona | Respuesta |
|----------|--------------------------|-----------|
| Lenguaje de la UI | "¿María entendería este término?" | → Reemplazar jerga financiera por lenguaje cotidiano |
| Onboarding | "¿María tiene tiempo para un tutorial largo?" | → Tutorial de 30 segundos, profundizar después |
| Contenido educativo | "¿María dónde busca aprender?" | → Videos cortos en formato social |
| Producto mínimo | "¿Qué haría María sentirse segura?" | → Empezar con fondos de bajo riesgo |

---

## 📅 Cuándo usarlo

### Fases recomendadas:

- **Discover** — Después de investigar usuarios (entrevistas, encuestas)
- **Define** — Para crystalizar el target y guiar el problem statement
- **Develop** — Para guiar decisiones de diseño
- **Deliver** — Para validar que la solución funciona para la audiencia objetivo

### Situaciones ideales:

- ✅ Para comunicar insights de usuarios al equipo
- ✅ Para tomar decisiones de diseño cuando hay desacuerdos
- ✅ Para alinear a stakeholders sobre quién es el usuario
- ✅ En workshops de ideación
- ✅ Al diseñar productos nuevos o iterar existentes
- ✅ Para crear contenido que resuene con la audiencia

### No usar cuando:

- ❌ No tienes datos de usuarios (investiga primero)
- ❌ El producto tiene audiencias muy diferentes (considera múltiples personas)
- ❌ Solo necesitas datos demográficos (usa otras herramientas)

---

## 🛠️ Herramientas digitales

### Para crear Personas:

| Herramienta | Descripción | Precio |
|-------------|-------------|--------|
| **Miro** | Pizarra colaborativa con templates | Gratis (limitado) |
| **Figma** | Templates de personas embebidos | Gratis |
| **Canva** | Plantillas visuales attractivas | Gratis |
| **Xtensio** | Herramienta especializada en personas | Prueba gratis |
| **Persona Co** | Creador de personas con IA | Gratis |

### Plantillas:

- [Plantilla Persona - Miro](https://miro.com/templates/user-persona/)
- [Plantilla Xtensio](https://xtensio.com/templates/persona/)
- [The Persona Lifecycle - Cooper](https://www.cooper.com/)

### Para investigación de usuarios previa:

| Herramienta | Descripción | Precio |
|-------------|-------------|--------|
| **Dovetail** | Plataforma de research cualitativo | Prueba gratis |
| **UserTesting** | Videos de usuarios reales | De pago |
| **Typeform** | Encuestas | Prueba gratis |

---

## 📚 Recursos adicionales

- [ personas - Nielsen Norman Group](https://www.nngroup.com/articles/persona/)
- [The Origin of Personas - Cooper](https://www.cooper.com/origin-of-personas)
- [How to Create Personas - Interaction Design](https://www.interaction-design.org/libraries/how_to_create_personas)

---

> 🐾 Herramienta de Discover > Cliente/Mercado