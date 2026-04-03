import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ─── AUTH SEED DATA ─────────────────────────────────────────────────────────

const PERMISSIONS = [
  { codigo: 'users:create', descripcion: 'Crear usuarios' },
  { codigo: 'users:read', descripcion: 'Leer usuarios' },
  { codigo: 'users:update', descripcion: 'Actualizar usuarios' },
  { codigo: 'users:delete', descripcion: 'Eliminar usuarios' },
  { codigo: 'permissions:read', descripcion: 'Leer permisos y roles' },
  { codigo: 'permissions:update', descripcion: 'Actualizar permisos y roles' },
  { codigo: 'assets:upload', descripcion: 'Subir archivos' },
];

const ROLES = [
  {
    codigo: 'ADMIN',
    nombre: 'Administrador',
    descripcion: 'Acceso completo al sistema',
    permissions: [
      'users:create',
      'users:read',
      'users:update',
      'users:delete',
      'permissions:read',
      'permissions:update',
      'assets:upload',
    ],
  },
  {
    codigo: 'EDITOR',
    nombre: 'Editor',
    descripcion: 'Puede crear y editar contenido',
    permissions: [
      'users:read',
      'users:update',
      'permissions:read',
      'assets:upload',
    ],
  },
  {
    codigo: 'VIEWER',
    nombre: 'Visualizador',
    descripcion: 'Solo puede leer contenido',
    permissions: ['users:read', 'permissions:read'],
  },
];

// ─── CATALOG SEED DATA ──────────────────────────────────────────────────────

const DESIGN_PHASES = [
  { codigo: 'discover', nombre: 'Discover', descripcion: 'Investigar, empatizar y entender el problema', orden: 1 },
  { codigo: 'define', nombre: 'Define', descripcion: 'Sintetizar insights y definir el problema', orden: 2 },
  { codigo: 'develop', nombre: 'Develop', descripcion: 'Generar, prototipar y validar soluciones', orden: 3 },
  { codigo: 'deliver', nombre: 'Deliver', descripcion: 'Validar, implementar y lanzar', orden: 4 },
];

const TOOL_CATEGORIES = [
  { codigo: 'discover-empresa', nombre: 'Empresa', phaseCodigo: 'discover', descripcion: 'Analisis interno del negocio' },
  { codigo: 'discover-cliente-mercado', nombre: 'Cliente/Mercado', phaseCodigo: 'discover', descripcion: 'Investigacion del usuario y mercado' },
  { codigo: 'define-investigacion', nombre: 'Investigacion', phaseCodigo: 'define', descripcion: 'Tecnicas para recopilar datos' },
  { codigo: 'define-sintesis', nombre: 'Sintesis', phaseCodigo: 'define', descripcion: 'Herramientas para analizar y definir' },
  { codigo: 'develop-idear', nombre: 'Idear', phaseCodigo: 'develop', descripcion: 'Tecnicas para generar ideas' },
  { codigo: 'develop-prototipar', nombre: 'Prototipar', phaseCodigo: 'develop', descripcion: 'Tecnicas para crear prototipos' },
  { codigo: 'develop-herramientas', nombre: 'Herramientas', phaseCodigo: 'develop', descripcion: 'Herramientas de diseno y documentacion' },
  { codigo: 'deliver-preparacion', nombre: 'Preparacion', phaseCodigo: 'deliver', descripcion: 'Planificacion para entrega' },
  { codigo: 'deliver-tecnicas', nombre: 'Tecnicas', phaseCodigo: 'deliver', descripcion: 'Tecnicas de validacion' },
];

const TOOLS: { codigo: string; nombre: string; descripcion: string; comoSeUsa?: string; cuandoUsarlo?: string; ejemplo?: string }[] = [
  // Discover > Empresa
  {
    codigo: '5-porques',
    nombre: 'Los 5 Porqués',
    descripcion: 'Técnica de análisis causal que consiste en preguntar "por qué" cinco veces para llegar a la raíz de un problema.',
    comoSeUsa: `Describí el problema inicial con claridad. Luego respondé "¿por qué ocurre esto?" y usá esa respuesta como punto de partida para el siguiente "¿por qué?". Repetí el proceso hasta llegar a una causa que ya no tenga otro "por qué" detrás — generalmente en 3 a 5 iteraciones.`,
    cuandoUsarlo: `Cuando tenés un problema recurrente y las soluciones que probaste no funcionan. También cuando el equipo debate sobre síntomas en lugar de causas reales. No es ideal para problemas complejos con múltiples causas simultáneas — en esos casos combinarlo con un diagrama de Ishikawa.`,
    ejemplo: `Problema: "Los usuarios abandonan el checkout". ¿Por qué? → Formulario muy largo. ¿Por qué? → Pedimos datos que no usamos. ¿Por qué? → Nunca cuestionamos el formulario original. ¿Por qué? → No hay proceso de revisión de flujos. Causa raíz: falta de cultura de revisión de UX periódica.`,
  },
  {
    codigo: 'analogos-antilogos',
    nombre: 'Análogos y Antilogos',
    descripcion: 'Herramienta para identificar referentes positivos (análogos) y negativos (antilogos) que inspiren o adviertan sobre el diseño.',
    comoSeUsa: `Para Análogos: (1) Definí el problema claramente. (2) Identificá industrias diferentes que enfrenten problemas similares. (3) Investigá soluciones exitosas en esos sectores. (4) Analizá el mecanismo subyacente — no copies la solución, entendé el principio. (5) Adaptá ese principio a tu contexto. Para Antilogos: (1) Identificá casos de fracaso en otros contextos. (2) Analizá por qué fallaron y qué condiciones causaron el fracaso. (3) Identificá los errores específicos. (4) Diseñá salvaguardas contra esos errores en tu solución.`,
    cuandoUsarlo: `Cuando hay bloqueos creativos y el equipo necesita inspiración externa. Para innovación disruptiva en industrias nuevas. En workshops de ideación. Cuando necesitás validar una idea contra precedentes de éxito o fracaso. No usar cuando el problema ya tiene soluciones obvias o el tiempo disponible es muy limitado para investigar.`,
    ejemplo: `Empresa de logística urbana. Análogo — Aviación (sistema de slots): adaptación → citas de entrega en ventanas de 30 minutos. Análogo — Streaming CDN: adaptación → hubs de distribución locales por barrio. Antilogo — Amazon Fresh (entregas fallidas en primeras horas): error a evitar → no prometer ventanas demasiado precisas sin capacidad operativa. Antilogo — Groupon (descuentos insostenibles): error a evitar → no depender del precio como único diferenciador.`,
  },
  {
    codigo: 'business-model-canvas',
    nombre: 'Business Model Canvas',
    descripcion: 'Herramienta estratégica de visualización y diseño de modelos de negocio en 9 bloques interdependientes.',
    comoSeUsa: `Completá los 9 bloques empezando por la Propuesta de Valor — es el centro de todo. Luego definí a quién le llegás (Segmentos y Canales) y cómo generás dinero (Fuentes de Ingreso). Finalmente completá los bloques de operación (Recursos, Actividades, Socios) y costos. No necesitás completar todos para generar el análisis.`,
    cuandoUsarlo: `Cuando querés visualizar y comunicar cómo funciona tu modelo de negocio completo en una sola página. Ideal para validar hipótesis de negocio, preparar una presentación a inversores, o detectar incoherencias entre cómo operás y cómo generás valor.`,
    ejemplo: `Una app de idiomas: Propuesta de valor (aprendizaje gamificado en 10 minutos diarios), Segmento (adultos 25-40 con poco tiempo), Canal (app store + redes), Ingreso (suscripción mensual), Recursos (tecnología + contenido), Costo (desarrollo y marketing de adquisición).`,
  },
  {
    codigo: 'diagnostico-industria',
    nombre: 'Diagnóstico de la Industria',
    descripcion: 'Análisis del entorno competitivo y las fuerzas que afectan a la industria.',
    comoSeUsa: `Completá cada fuerza de Porter con observaciones concretas de tu industria — con 2 o 3 puntos por fuerza es suficiente. Podés dejar fuerzas vacías si no tenés información: la IA inferirá del contexto disponible. La sección de Tendencias es opcional pero enriquece mucho el análisis.`,
    cuandoUsarlo: `Antes de definir el posicionamiento estratégico, al evaluar si vale la pena entrar a un mercado, o cuando querés entender por qué la competencia está ganando. Ideal en etapas de Exploración o Validación, antes de comprometer recursos significativos.`,
    ejemplo: `Una fintech B2B: Rivalidad alta (Mercado Pago y Naranja X dominan), Nuevos entrantes bajos (regulación del BCRA como barrera), Clientes con alto poder (las pymes negocian condiciones), Sustitutos medios (el efectivo sigue siendo competencia). Resultado: industria moderadamente atractiva para nichos desatendidos.`,
  },
  {
    codigo: 'diagrama-sistema',
    nombre: 'Diagrama de Sistema',
    descripcion: 'Representación visual de los actores, relaciones, flujos e interdependencias que conforman un ecosistema o sistema. Permite entender la complejidad más allá de sus partes individuales, capturando interacciones dinámicas, bucles de retroalimentación y puntos de palanca.',
    comoSeUsa: `Definí el alcance del sistema que querés mapear. Luego agregá los actores principales (personas, organizaciones, sistemas) indicando si están dentro o fuera de la frontera del sistema. Conectá los actores mediante relaciones, flujos (dinero, información, productos) o vínculos de regulación. Identificá bucles de retroalimentación: ¿qué ciclos se refuerzan o equilibran? Finalmente, buscá puntos de palanca donde un pequeño cambio tendría gran impacto. Usá "Analizar" para que la IA identifique actores clave, flujos críticos y recomendaciones estratégicas.`,
    cuandoUsarlo: `Antes de diseñar soluciones complejas con múltiples stakeholders. Para mapear el ecosistema y entender el contexto completo en la etapa de Discover. Para verificar que una solución considera todas las interacciones relevantes del sistema. Ideal en workshops con stakeholders para construir entendimiento compartido, o cuando el problema parece no tener solución obvia por la complejidad de actores involucrados.`,
    ejemplo: `Una fintech quiere lanzar crédito para freelancers. Actores: Gobierno (regulación), Bancos, Fintech (nosotros), Fondos de inversión, Freelancers, Plataformas (Upwork/Fiverr), Crédito informal. Conexiones: Gobierno regula a Bancos y Fintech; Freelancers obtienen ingresos de Plataformas; Bancos excluyen a Freelancers por falta de historial. Punto de palanca: integración con plataformas para acceder a datos de ingresos reales.`,
  },
  {
    codigo: 'foda',
    nombre: 'FODA (SWOT)',
    descripcion: 'Análisis de Fortalezas, Oportunidades, Debilidades y Amenazas para evaluar la posición estratégica.',
    comoSeUsa: `Listá en cada cuadrante los factores que corresponden: fortalezas y debilidades son internas al proyecto, oportunidades y amenazas son externas. No necesitás llenarlo todo — con 2 cuadrantes ya podés generar el análisis IA. Agregá ítems concretos y específicos, evitá generalidades.`,
    cuandoUsarlo: `Cuando necesitás una foto clara de la situación estratégica antes de tomar decisiones. Ideal al inicio de un proyecto, al evaluar un pivote, o cuando el equipo siente que "algo no está funcionando" pero no sabe exactamente qué.`,
    ejemplo: `Un startup de delivery lo usa antes de lanzar: fortalezas (equipo tech propio, precio competitivo), oportunidades (crecimiento del e-commerce local), debilidades (sin marca conocida), amenazas (PedidosYa y Rappi dominando el mercado).`,
  },
  {
    codigo: 'in-out',
    nombre: 'Diagrama In/Out',
    descripcion: 'Herramienta visual para definir los límites, flujos y transformaciones de un sistema, producto o proceso. Muestra qué entra (inputs), cómo se transforma (proceso), y qué sale (outputs).',
    comoSeUsa: '1. Define el sistema a analizar. 2. Identifica los inputs: información, recursos, materiales y factores externos. 3. Define el proceso central de transformación. 4. Identifica los outputs: productos/servicios, datos, feedback y desperdicios. 5. Valida con stakeholders que el diagrama refleja la realidad.',
    cuandoUsarlo: 'En la fase Discover para entender el flujo actual de un sistema. En Define para delimitar el scope del problema. En Develop para diseñar nuevos procesos. Ideal para comunicar cómo funciona un sistema a stakeholders, identificar gaps o ineficiencias, y definir el alcance de un producto o servicio.',
    ejemplo: 'Una empresa SaaS analiza su onboarding: INPUTS (usuario registrado, datos de empresa, preferencias) → PROCESO (bienvenida, tutorial, setup, primera acción) → OUTPUTS (usuario activo, dashboard personalizado, datos de telemetría). El análisis revela que se ignoran inputs externos (competidores, referencias) y outputs negativos (usuarios que abandonan en el step 2).',
  },

  // Discover > Cliente/Mercado
  {
    codigo: 'customer-journey-map',
    nombre: 'Customer Journey Map',
    descripcion: 'Representación visual de la experiencia de un usuario a lo largo del tiempo, desde que descubre un producto o servicio hasta que lo usa y más allá. Captura etapas, acciones, emociones, touchpoints, pain points y oportunidades de mejora desde la perspectiva del usuario.',
    comoSeUsa: '1. Definí el escenario: ¿qué journey específico vas a mapear? 2. Elegí un personaje o Persona concreta, no un usuario genérico. 3. Identificá las etapas del viaje (típicamente 4-7). 4. Para cada etapa completá: acciones del usuario, emociones, touchpoints, pain points y oportunidades. 5. Identificá los "momentos de la verdad" — puntos donde el usuario decide continuar o abandonar. 6. Derivá oportunidades priorizadas por impacto.',
    cuandoUsarlo: 'En la fase Discover para entender la experiencia actual del usuario con productos similares. En Define para identificar el problema específico a resolver. En Develop para diseñar soluciones que encajen en el journey. Ideal cuando querés entender por qué los usuarios abandonan un proceso, identificar gaps entre canales, o comunicar la experiencia del usuario al equipo.',
    ejemplo: 'Una tienda online mapea el journey de María comprando por primera vez: DESCUBRIMIENTO (ve ads en IG, curiosa) → CONSIDERACIÓN (visita el sitio, compara, emocionada pero no sabe si el producto cabe en su espacio) → DECISIÓN (intenta comprar, se frustra con el shipping costoso, abandona) → POST-COMPRA (recibe, satisfecha). Momento de la verdad: checkout con shipping inesperado. Oportunidad: mostrar costo de envío upfront en la página de producto.',
  },
  {
    codigo: 'mapa-empatia',
    nombre: 'Mapa de Empatía',
    descripcion: 'Herramienta visual creada por Dave Gray que captura lo que el usuario ve, oye, piensa, siente, dice y hace en un momento específico, revelando tensiones y oportunidades de diseño.',
    comoSeUsa: '1. Seleccioná un escenario específico (no "todos los usuarios", sino un momento concreto). 2. Usá datos reales de entrevistas u observaciones. 3. Completá los 6 cuadrantes: Ve, Oye, Piensa, Siente, Dice y Hace. 4. Buscá patrones y tensiones, especialmente entre lo que dice y lo que hace. 5. Derivá insights accionables para el diseño.',
    cuandoUsarlo: 'Después de hacer investigación cualitativa (entrevistas, etnografía) y antes de crear las Personas. También es útil en workshops de discovery con el equipo y cuando tenés datos contradictorios entre lo que el usuario dice y hace.',
    ejemplo: 'Equipo post-10 entrevistas con freelancers: Ve notificaciones de múltiples apps. Oye que "la multitarea es mala". Piensa "si no lo anoto se me olvida". Siente agotamiento y culpa. Dice "no me da la vida". Hace context switching cada 5 min. Insight: no necesita más features, necesita menos fricción cognitiva.',
  },
  {
    codigo: 'persona',
    nombre: 'User Persona',
    descripcion: 'Representación arquetípica de un usuario objetivo basada en datos reales de investigación.',
    comoSeUsa: `Completá cada sección basándote en datos reales: entrevistas, encuestas, analytics — no en suposiciones. Una persona bien construida tiene tensiones internas (lo que quiere vs. lo que teme) que la hacen creíble. Si no tenés investigación previa, usala como hipótesis inicial para validar.`,
    cuandoUsarlo: `Antes de diseñar cualquier solución, cuando el equipo tiene visiones distintas sobre quién es el usuario, o cuando las decisiones de diseño generan debates sin resolución. Una persona compartida da un criterio de decisión común: "¿esto sirve a María?"`,
    ejemplo: `María, 34 años, gerente de proyectos en una consultora. Objetivo: terminar su trabajo antes de las 18hs para buscar a sus hijos. Frustración: las herramientas de gestión son lentas y requieren mucha configuración. Comportamiento: usa el celular para todo, prefiere voz a texto cuando puede.`,
  },
  {
    codigo: 'role-play',
    nombre: 'Role Play',
    descripcion: 'Técnica de simulación donde los participantes actúan roles específicos para explorar situaciones, necesidades o problemas desde la perspectiva del usuario. Permite vivir la experiencia del usuario en lugar de solo observarla, generando empatía profunda e insights que no se obtienen con métodos tradicionales.',
    comoSeUsa: `1. Define el escenario: una situación específica y concreta a explorar. 2. Asigna roles: cada participante asume un personaje (usuario primario, stakeholder, customer service, etc.). 3. Establece el contexto: goals, constraints y backstory de cada personaje. 4. Actúa la situación: simula la interacción o proceso. 5. Observa y registra: capturá lo que sucede, especialmente lo inesperado. 6. Debrief: discutí insights, observaciones y aprendizajes derivados de la simulación.`,
    cuandoUsarlo: `Cuando necesitás entender procesos complejos con múltiples actores, identificar pain points en interacciones, construir empatía en el equipo, o cuando no tenés acceso a usuarios reales. Ideal en workshops de innovación, para validar cambios en servicio al cliente, o para explorar escenarios donde la observación pasiva no es suficiente.`,
    ejemplo: `Un banco quiere entender por qué los clientes abandonan el proceso de solicitud de tarjeta online. Escenario: cliente intentando solicitar una tarjeta desde su celular por primera vez. Rol 1: Juan (cliente primerizo, 28 años, autónomo) — quiere construir historial crediticio pero tiene dudas sobre los documentos necesarios. Rol 2: Bot del banco — responde preguntas estándar pero no entiende vocabulario de freelancers. Resultado: el bot no reconoce "comprobante de ingresos de freelance" y Juan abandona. Insight: el sistema no cubre el segmento de trabajadores independientes, un segmento en crecimiento.`,
  },
  {
    codigo: 'stakeholder-map',
    nombre: 'Stakeholder Map',
    descripcion: 'Mapa visual que identifica y clasifica a todos los actores involucrados en el proyecto según su influencia e interés, usando la matriz Poder/Interés con cuatro cuadrantes: Manage Closely, Keep Satisfied, Keep Informed y Monitor.',
    comoSeUsa: '1. Brainstorming inicial: listá todos los stakeholders potenciales sin limitarte. 2. Investigá: ¿quiénes son, qué les importa, qué poder tienen? 3. Clasificá cada actor por influencia (alto/bajo) e interés (alto/bajo) en la matriz. 4. Identificá relaciones entre actores y posibles alianzas o conflictos. 5. Definí estrategia para cada cuadrante: Manage Closely (involucrar activamente en decisiones), Keep Satisfied (mantener satisfechos, evitar sorpresas), Keep Informed (informar regularmente, escuchar feedback), Monitor (observar, mínimo esfuerzo). 6. Revisá periódicamente porque los stakeholders cambian.',
    cuandoUsarlo: 'Al inicio de cualquier proyecto nuevo para mapear el ecosistema. Para planificar comunicación y gestión de relaciones. En proyectos con múltiples dependencias internas/externas. Cuando hay conflictos de interés potenciales. En productos con ecosistemas complejos (SaaS, marketplace, plataformas). Antes de presentar a clientes o stakeholders clave.',
    ejemplo: 'Una empresa de salud lanza una app de telemedicina. MANAGE CLOSELY: Pacientes y Médicos (gatekeepers de adopción). KEEP SATISFIED: Inversionistas y Proveedores de tecnología. KEEP INFORMED: Familiares de pacientes y Seguros médicos. MONITOR: Medios y Comunidades online. Hallazgo clave: los médicos son los gatekeepers críticos — sin ellos la app no funciona; los reguladores tienen alto poder aunque bajo interés operativo.',
  },

  // Define > Investigación
  {
    codigo: 'benchmarking',
    nombre: 'Benchmarking',
    descripcion: 'Proceso de analizar productos, servicios o procesos de competidores o empresas líderes para comparar, aprender e identificar oportunidades de diferenciación. Permite entender dónde estás parado en el mercado y qué puedes aprender de otros — no para copiar, sino para entender por qué ciertas soluciones funcionan.',
    comoSeUsa: '1. Definí qué vas a comparar (features, UX, pricing, onboarding, etc.). 2. Seleccioná 3-5 competidores target, incluyendo líderes de otras industrias. 3. Definí los criterios de evaluación como filas de la matriz. 4. Completá los valores para tu producto y cada competidor. 5. Analizá brechas, ventajas y oportunidades de diferenciación.',
    cuandoUsarlo: 'Antes de definir el roadmap de producto para entender el landscape competitivo. En procesos de redesign o al entrar a un nuevo mercado. Para validar la propuesta de valor. Ideal en la fase Define para informar decisiones de producto.',
    ejemplo: 'Una fintech compara apps de inversión: CRITERIOS (Onboarding, UI, Educación integrada, Gamificación) × COMPETIDORES (Robinhood, Fintual). Robinhood lidera en UX y gamificación pero no tiene educación. Fintual tiene educación pero UI más compleja. OPORTUNIDAD: crear una app que combine la simplicidad de Robinhood con la educación de Fintual.',
  },
  {
    codigo: 'busqueda-medios',
    nombre: 'Búsqueda de Medios',
    descripcion: 'Investigación sistemática en medios de comunicación para recopilar información relevante sobre el contexto del proyecto.',
    comoSeUsa: '1. Definí el tema central de investigación. 2. Formulá queries de búsqueda para Google, redes sociales y portales especializados. 3. Registrá los hallazgos más relevantes clasificándolos por tipo de medio (noticia, blog, podcast, etc.). 4. Para cada hallazgo, anotá la fuente y el insight clave. 5. Sintetizá tendencias, narrativas dominantes y gaps de cobertura. 6. Evaluá el sentiment general del discurso en los medios.',
    cuandoUsarlo: 'Al inicio de la fase de investigación para entender el contexto mediático del problema. Útil para mapear el discurso público, identificar narrativas dominantes y detectar gaps de información. Complementa las entrevistas con datos de fuentes secundarias. Ideal antes de definir el brief creativo o la estrategia de comunicación.',
    ejemplo: 'Investigando "movilidad urbana sustentable": QUERIES: "bicicletas eléctricas Argentina 2024", "microtransporte CABA". HALLAZGOS: artículo en La Nación sobre boom de e-bikes (insight: crecimiento 40% YoY), podcast sobre infraestructura ciclista en Latinoamérica. TENDENCIAS: electrificación del transporte personal, rechazo a autos en zonas céntricas. GAP: poca cobertura sobre accesibilidad económica para sectores de bajos ingresos.',
  },
  {
    codigo: 'buzz-report',
    nombre: 'Buzz Report',
    descripcion: 'Informe de menciones y conversaciones en medios digitales y redes sociales sobre un tema o marca.',
    comoSeUsa: '1. Definí la marca, producto o tema a monitorear y el período de tiempo. 2. Registrá las menciones encontradas en redes sociales, noticias y foros, indicando canal y sentiment (positivo/neutro/negativo). 3. Para cada mención anotá el autor, el contenido clave y el alcance estimado. 4. Identificá los temas recurrentes y las voces más influyentes. 5. Describí la percepción general del buzz. 6. Generá el análisis IA para obtener breakdown de sentiment, canales clave, oportunidades y riesgos.',
    cuandoUsarlo: 'Cuando necesitás entender cómo se está hablando de tu marca, producto o campaña en el entorno digital. Ideal antes de lanzar una estrategia de comunicación, durante una crisis reputacional, o al evaluar el impacto de una campaña reciente. En el Double Diamond, se usa en la fase Define para contextualizar el problema desde la perspectiva de la conversación pública.',
    ejemplo: 'Monitoring de "Marca X lanzamiento zapatos": MENCIONES: tweet viral positivo (50K impresiones) sobre el diseño, reseña negativa en blog sobre el precio, post de influencer neutral probando el producto. TEMAS RECURRENTES: precio elevado, diseño innovador. SENTIMENT: 40% positivo, 35% neutro, 25% negativo concentrado en precio. OPORTUNIDAD: capitalizar el elogio al diseño con contenido UGC. RIESGO: narrativa de precio inasequible puede frenar conversiones.',
  },
  {
    codigo: 'cliente-misterioso',
    nombre: 'Cliente Misterioso',
    descripcion: 'Técnica de investigación donde una persona entrenada evalúa un servicio, producto o proceso actuando como cliente común, revelando problemas que los usuarios no reportan porque se han acostumbrado a ellos.',
    comoSeUsa: `Definí los criterios de evaluación (UX, servicio, proceso, pricing). Creá una guía con el checklist de observación y seleccioná los escenarios a ejecutar. Realizá la visita como cliente normal sin revelar tu rol. Documentá los pasos con tiempos, issues encontrados con nivel de impacto (alto/medio/bajo) y un score general de 1-5. Analizá los hallazgos para identificar fricciones y oportunidades de mejora.`,
    cuandoUsarlo: `En Discover para entender la experiencia actual, en Define para priorizar problemas a resolver, y en Deliver para validar que la solución funciona. Ideal para audits de servicio al cliente, evaluación de competidores y para encontrar problemas ocultos en la experiencia. No usar cuando el contexto es muy especializado o el servicio es muy técnico.`,
    ejemplo: `Evaluación de onboarding en app de banking. Canal: App móvil. Escenario: usuario nuevo crea cuenta. Hallazgos: instrucciones confusas para subir INE (abandono alto, prioridad #1), error en vinculación bancaria sin feedback claro (prioridad #2), campos de dirección excesivos (prioridad #3). Score: 2/5. Tiempo total: 15 min + 2 horas espera de revisión. Insight: la fricción en documentos e instrucciones poco claras genera abandono en el paso más crítico del journey.`,
  },
  {
    codigo: 'entrevista-cualitativa',
    nombre: 'Entrevista Cualitativa',
    descripcion: 'Conversación estructurada o semi-estructurada para obtener insights profundos sobre experiencias y necesidades del usuario.',
    comoSeUsa: '1. Definí los objetivos: qué querés aprender o qué hipótesis querés explorar. 2. Realizá la entrevista con el usuario real. 3. Registrá cada pregunta y la respuesta del entrevistado con sus propias palabras. 4. Anotá citas textuales que capturen insights relevantes. 5. Documentá observaciones no verbales, contradicciones y lo que se sintió pero no se dijo. 6. Generá el análisis IA para extraer needs, pain points, motivaciones e insights de diseño.',
    cuandoUsarlo: 'Cuando necesitás entender el "por qué" detrás de los comportamientos del usuario. Ideal en la fase de Discover para explorar problemas y necesidades, y en la fase de Deliver para validar conceptos o prototipos. Más poderosa que las encuestas para capturar contexto, emociones y motivaciones latentes. Una entrevista bien hecha puede reemplazar 100 encuestas.',
    ejemplo: 'Entrevistando a María (35, emprendedora): OBJETIVO: entender por qué abandona herramientas de gestión. P: "¿Qué pasa cuando empezás a usar una app nueva?" R: "La pruebo unos días y después la abandono, no sé por qué pero siento que me complica más de lo que me ayuda". CITA CLAVE: "Prefiero la lista de papel, al menos sé que está". INSIGHT: la fricción de adopción supera el valor percibido — necesita wins rápidos en los primeros 3 usos.',
  },
  {
    codigo: 'entrevista-experto',
    nombre: 'Entrevista con Experto',
    descripcion: 'Entrevista con especialistas del dominio para obtener conocimiento técnico y perspectivas informadas.',
    comoSeUsa: '1. Identificá al experto: su área de expertise, organización y cargo. 2. Definí los objetivos: qué conocimiento técnico o perspectivas estratégicas buscás obtener. 3. Preparás preguntas enfocadas en tendencias del sector, barreras estructurales, oportunidades y regulaciones. 4. Realizá la entrevista y registrá cada pregunta con la respuesta técnica detallada del experto. 5. Anotá citas técnicas que capturen perspectivas únicas que no se obtienen de fuentes públicas. 6. Documentá el conocimiento implícito, sesgos percibidos y contradicciones con otras fuentes. 7. Generá el análisis IA para extraer tendencias, barreras, oportunidades e implicaciones estratégicas.',
    cuandoUsarlo: 'Cuando necesitás información técnica de primera mano que no está disponible en fuentes públicas. Ideal en la fase de Discover para entender el estado del arte del sector, en Define para identificar restricciones técnicas y regulatorias, y en Develop para validar la viabilidad técnica de la solución. Un experto puede condensar años de experiencia en una conversación de 60 minutos y evitar errores costosos.',
    ejemplo: 'Proyecto: app de telemedicina. EXPERTO: Dra. González, médica clínica con 15 años en salud digital. OBJETIVO: entender las barreras regulatorias y de adopción. P: "¿Cuál es el mayor obstáculo para digitalizar la consulta médica en Argentina?" R: "No es la tecnología, es la facturación. Las obras sociales no tienen un código de prestación para teleconsulta, entonces el médico no cobra igual. Hasta que eso no se resuelva, el incentivo no existe". CITA TÉCNICA: "El médico va a usar la herramienta que le permita cobrar, no la que tenga mejor UX". INSIGHT: la adopción depende del modelo de pago, no de la usabilidad — el diseño debe contemplar la integración con sistemas de facturación médica.',
  },
  {
    codigo: 'foto-video-etnografia',
    nombre: 'Foto-Vídeo Etnografía',
    descripcion: 'Técnica de investigación de campo que documenta visualmente el contexto y comportamientos del usuario mediante fotografía y video.',
    comoSeUsa: '1. Definí el objetivo de campo: qué querés observar y documentar visualmente. 2. Planificá las salidas: fechas, lugares, quién hace fotos y quién registra video. 3. Durante la salida de campo, documentá el entorno físico, herramientas y objetos del usuario, comportamientos y gestos, emociones visibles y workarounds. 4. Organizá el material en carpetas por fecha, lugar o tema. 5. Para cada registro (foto/video) anotá: qué muestra, dónde fue tomado, quién o qué es el sujeto, qué observás y qué revela sobre el usuario. 6. Identificá patrones visuales que emergen del conjunto. 7. Generá el análisis IA para extraer insights etnográficos, workarounds detectados y oportunidades de diseño.',
    cuandoUsarlo: 'En las fases de Discover y Define. Ideal cuando el contexto físico del usuario es parte del problema, para capturar workarounds e improvisaciones, y para comunicar hallazgos de campo a miembros del equipo que no estuvieron presentes. Las imágenes capturan detalles del entorno y comportamientos que las notas escritas suelen perder. No usar cuando el usuario no da permiso para ser documentado o el tema es muy personal o sensible.',
    ejemplo: 'Equipo diseñando para pequeños comerciantes. En un almacén de barrio fotografiaron una libreta manuscrita con cuentas, fotos de clientes recortadas y post-its con precios pegados detrás del mostrador. Observación: sistema de gestión analógico y relacional. Insight: conocer al cliente es parte del negocio — no es un dato, es una relación. La solución digital debe respetar esta dimensión relacional.',
  },
  {
    codigo: 'focus-group',
    nombre: 'Focus Group',
    descripcion: 'Sesión grupal moderada para explorar percepciones, opiniones y actitudes de usuarios sobre un tema.',
    comoSeUsa: '1. Definí los objetivos: qué querés aprender y qué hipótesis explorar con el grupo. 2. Seleccioná participantes del mismo segmento con perfil específico (6-10 personas). 3. Creá una guía de discusión con preguntas por fase: icebreaker (0-10 min), warm-up (10-20 min), discusión principal (20-45 min) y síntesis (45-60 min). 4. Preparás materiales o estímulos si aplica (prototipos, imágenes, productos). 5. Durante la sesión, registrá las respuestas grupales de cada pregunta, las dinámicas (quién influyó en quién, consensos, disensos) y citas textuales clave. 6. Documentá observaciones generales: clima, comportamientos no verbales, lo que no se dijo pero se sintió. 7. Generá el análisis IA para obtener patrones, insights grupales, consensos, disensos y recomendaciones de diseño.',
    cuandoUsarlo: 'En las fases de Discover y Define. Ideal para entender percepciones de marca, probar prototipos o mensajes, y cuando necesitás debate y diversidad de perspectivas. La fuerza del focus group está en la interacción entre participantes — las ideas de uno inspiran a otros, los debates revelan perspectivas opuestas y las reacciones grupales muestran cómo se forman las opiniones en contexto social. No usar cuando necesitás datos estadísticos, el tema es muy personal o sensible, o los participantes no se conocen entre sí.',
    ejemplo: 'Equipo validando concepto de app de meditación. PERFIL: 8 profesionales ocupados, 28-45 años. PREGUNTA PRINCIPAL: "¿Cómo manejan el estrés en su vida diaria?" RESPUESTAS GRUPALES: nadie tenía tiempo para meditación, varios mencionaron haber abandonado apps. DINÁMICA CLAVE: cuando un participante mencionó que su jefe usa Headspace, el tono del grupo cambió de escéptico a curioso — el efecto de autoridad percibida fue determinante. CITA: "Prefiero 3 minutos que funcionen a 20 minutos que nunca hago". INSIGHT GRUPAL: los profesionales necesitan micro-meditación (1-3 min) enmarcada como "recuperación de energía", no como "esfuerzo". El grupo validó socialmente este framing de manera espontánea.',
  },
  {
    codigo: 'investigacion-remota',
    nombre: 'Investigación Remota',
    descripcion: 'Conjunto de métodos de investigación de usuarios realizados a distancia mediante herramientas digitales: encuestas, entrevistas por video, diary studies y testing remoto.',
    comoSeUsa: `Definí el objetivo de la investigación y seleccioná el método más adecuado: encuestas para validar hipótesis a escala, entrevistas por video para profundizar en insights, diary studies para entender el uso a lo largo del tiempo, y testing remoto (Maze, UserTesting) para validar usabilidad. Prepará los materiales (guiones, tareas, encuestas), reclutá participantes, ejecutá la sesión y analizá los resultados buscando patrones cruzados entre métodos.`,
    cuandoUsarlo: `Cuando el budget es limitado o los usuarios están distribuidos geográficamente. Ideal para iteración rápida de insights, cuando necesitás escala (muchos participantes) o cuando el equipo es distribuido. No usar cuando necesitás observación contextual profunda, cuando los usuarios no tienen acceso a tecnología o cuando la señal no verbal es crítica para el análisis.`,
    ejemplo: `Equipo en CDMX investiga usuarios en Guadalajara, Monterrey y Mérida. Método 1: Encuesta (450 usuarios) → 70% usan la app en transporte, 45% usan Android. Método 2: Entrevistas por video (12 usuarios) → usuarios de Mérida prefieren efectivo, los de Monterrey son más activos en horarios nocturnos. Método 3: Unmoderated testing (30 usuarios, Maze) → score 65/100, el botón de pago no es visible. Insight: no hay un "usuario mexicano" único — las necesidades varían por ciudad.`,
  },
  {
    codigo: 'perspectiva-360',
    nombre: 'Perspectiva 360',
    descripcion: 'Técnica de análisis holístico que examina un problema o producto desde 7 ángulos: usuario, negocio, tecnología, competencia, stakeholders, legal y tendencias.',
    comoSeUsa: `Definí el objeto de estudio. Luego completá cada perspectiva con insights clave: Usuario (necesidades, pain points), Negocio (revenue, KPIs), Tecnología (viabilidad, constraints), Competencia (alternativas, gaps), Stakeholders (poder, intereses), Legal (regulaciones, compliance), Tendencias (dirección de la industria). Buscá activamente los conflictos entre perspectivas — las mejores insights vienen de cuando se contradicen entre sí. Documentá las fuentes para cada perspectiva.`,
    cuandoUsarlo: `En Define para construir una visión completa del problema antes de diseñar soluciones. En Develop para validar que la solución considera todas las restricciones. Ideal antes de la definición de producto, para validar viabilidad en strategic planning, y cuando hay muchos stakeholders con perspectivas diferentes. No usar cuando el proyecto está muy acotado o no tenés acceso a información de todas las perspectivas.`,
    ejemplo: `Banco tradicional lanzando app de banca móvil. Usuario: quiere simplicidad, frustra las comisiones. Negocio: CAC de $50, necesita LTV > $200. Tecnología: integración con legacy systems toma 6 meses. Competencia: ningún banco tradicional tiene onboarding en menos de 15 minutos. Stakeholders: área IT bloqueadora. Legal: aprobación regulatoria mínima 6 meses. Tendencias: Open banking habilitará APIs de terceros. Insight clave: la oportunidad está en el onboarding de 5 minutos, pero el bottleneck regulatorio es innegociable — lanzar MVP limitado mientras se espera la aprobación.`,
  },
  {
    codigo: 'safari',
    nombre: 'Safari / Design Safari',
    descripcion: 'Técnica de observación de campo donde el equipo sale a explorar entornos reales para observar cómo las personas interactúan con productos, servicios o espacios similares al que se está diseñando. A diferencia del shadowing, el safari es más corto, más amplio, y se enfoca en múltiples usuarios en contextos públicos.',
    comoSeUsa: `1. Definir el objetivo: qué querés observar (no "todo", sino algo específico). 2. Elegir la ubicación: dónde ocurre la experiencia relevante para tu proyecto. 3. Crear guía de observación: qué categorías observar — contexto físico, acciones, pain points, workarounds, emociones, dinámicas sociales. 4. Asignar roles al equipo. 5. Ejecutar el safari sin interactuar con los usuarios. 6. Hacer debrief inmediato al terminar. 7. Documentar sesiones con momento, observación e insight. 8. Compilar y buscar patrones cross-sesiones.`,
    cuandoUsarlo: `En Discover para empatía y entendimiento del contexto real. En Define antes de diseñar soluciones, para validar supuestos con comportamiento real. Ideal para observar competidores o servicios análogos, para inspirar innovación, cuando los usuarios hacen cosas diferentes a lo que dicen en entrevistas, y cuando necesitás evidencia de comportamiento real — no auto-reportado.`,
    ejemplo: `Equipo diseñando solución de ejercicio en casa. Safari 1 en gym: observan que las personas esperan en recepción de forma social, usan candados propios (no confían), los trainers son clave para la motivación, la energía grupal es diferente. Safari 2 en departamento pequeño: el espacio es reducido, la yoga mat se guarda bajo el sofá, YouTube es el "instructor", las interrupciones cortan la rutina. Insight síntesis: el ejercicio en casa tiene desafíos distintos al gym — falta espacio y estructura — pero ofrece privacidad. La solución debería integrar comunidad (como el gym) con flexibilidad (como home).`,
  },
  {
    codigo: 'shadowing',
    nombre: 'Shadowing',
    descripcion: 'Técnica de investigación donde un investigador observa a un usuario en su entorno natural mientras realiza sus actividades cotidianas, sin intervenir. El usuario NO está siendo interrogado ni en un entorno artificial: está haciendo lo que normalmente hace, lo que revela comportamientos reales y problemas que el usuario podría no mencionar en una entrevista.',
    comoSeUsa: `Tipos: Pasivo (solo observar, no interactuar), Activo (preguntas durante pausas), Remoto (cámara/screen share), Participativo (ayudar mientras observás). Pasos: 1. Definir el objetivo — qué querés aprender. 2. Seleccionar participantes — usuarios target. 3. Obtener consentimiento. 4. Preparar guía de observación: flujo de trabajo, decisiones, frustraciones, herramientas usadas, workarounds, contexto social, entorno físico. 5. Ejecutar la sesión (30 min a varias horas). 6. Documentar inmediatamente después — máximo 30 minutos. 7. Identificar patrones en múltiples usuarios. Consejos: Sé discreto, observá más que preguntar, mirá más allá del task (qué hace entre tareas), documentá el contexto (no solo el qué, sino el cómo).`,
    cuandoUsarlo: `En Discover para exploración profunda. En Define para validar el problema y contexto con comportamiento real. Ideal para entender flujos de trabajo reales, identificar pain points invisibles, investigación de UX compleja, productos enterprise o especializados, y cuando el comportamiento real difiere de lo que los usuarios reportan en entrevistas.`,
    ejemplo: `Equipo diseñando software para doctores. Shadowing al Dr. Martínez durante 4 horas. 9:00 — llega, enciende la PC, espera 3 min (sistema lento). 9:15 — copia datos a mano antes de tipear (no integración con otros sistemas). 9:30 — busca historial en 3 sistemas distintos (no hay vista unificada). 10:00 — frustración visible cuando el sistema se congela (afecta la relación con el paciente). 10:30 — escribe notas en papel y las transcribe después (duplicación de trabajo). Insight clave: el problema no es solo la interfaz, sino la falta de integración entre sistemas. El doctor hace manual lo que el software debería hacer — afecta directamente el tiempo con pacientes.`,
  },
  {
    codigo: 'visita-campo',
    nombre: 'Visita de Campo',
    descripcion: 'Técnica de investigación donde el equipo visita el lugar de trabajo o vida de los usuarios para observar, experimentar y entender el contexto de primera mano. Más inmersiva que el safari — vas al entorno natural del usuario y podés observar, preguntar y hacer la tarea vos mismo. Revela información que el usuario no mencionaría en una entrevista porque es "demasiado obvia" para ellos.',
    comoSeUsa: `1. Definir el objetivo — qué querés entender. 2. Coordinar con usuarios — pedir permiso, explicar el propósito. 3. Preparar guía de visita: áreas a observar y preguntas clave. 4. Asignar roles al equipo — quién observa, quién documenta, quién conversa. Durante la visita: Observar (entorno, herramientas, procesos), Preguntar sobre lo que no entendés, Experimentar (hacer la tarea vos mismo si es posible), Documentar con fotos/video (con permiso). Después: debrief inmediato (máx 30 min), consolidar hallazgos, identificar insights y priorizar por impacto.`,
    cuandoUsarlo: `En Discover para exploración inicial del contexto real. En Define para validar el problema con evidencia de campo. Ideal para productos físicos o servicios in-situ, espacios de trabajo remotos, cuando el contexto afecta significativamente el uso, y para validar supuestos de diseño antes de prototipar. No usar cuando no tenés acceso al lugar o cuando el entorno es muy privado o sensible.`,
    ejemplo: `Equipo diseñando terminal POS para restaurantes. Visita a 3 restaurantes durante almuerzo y cena. Observaciones: el mesero camina 10m al POS cada pedido (debería ser móvil); bajo presión saltan pasos del flujo (sistema muy complejo para momentos pico); usan verbal cues con cocina que el sistema no captura (la comunicación verbal es crítica); el POS no cabe en el bolsillo del delantal (el tamaño importa). Insight clave: el problema no es solo el software sino el contexto físico del servicio. La solución necesita ser móvil, simple en momentos pico, e integrada con la comunicación de cocina.`,
  },

  // Define > Síntesis
  {
    codigo: 'brief',
    nombre: 'Brief',
    descripcion: 'Documento que resume los objetivos, alcance, restricciones y criterios de éxito del proyecto de diseño.',
    comoSeUsa: `Completá las 10 secciones del Brief: Contexto (por qué existe el proyecto), Objetivo principal (SMART) y secundarios, Usuario Target, Scope (qué está IN y OUT), Restricciones (timeline, budget, tech), Stakeholders (decision maker, contacto, equipo), Entregables, Métricas de Éxito, Riesgos, y Timeline de Milestones. Con contexto + objetivo principal podés generar el análisis AI, que audita el brief completo e identifica gaps críticos y alertas antes de arrancar.`,
    cuandoUsarlo: `Al inicio de cualquier proyecto de diseño para establecer el scope y alinear expectativas. Antes del kickoff con el equipo y stakeholders. Como referencia durante el proyecto para evitar scope creep. También para proyectos donde el problema no está completamente claro — el proceso de completar el brief ayuda a identificar qué se sabe y qué falta investigar.`,
    ejemplo: `Contexto: "La app actual tiene un rating de 3.2 estrellas, el equipo quiere mejorar retención antes del Q3". Objetivo principal: "Aumentar checkout completion rate de 45% a 60% en 6 meses". In scope: checkout flow, navegación, product detail. Out of scope: programa de loyalty, chat de soporte. Timeline: 12 semanas. Métrica: checkout completion 45% → 60%.`,
  },
  {
    codigo: 'desafio-diseno',
    nombre: 'Desafío de Diseño',
    descripcion: 'Formulación concisa del problema a resolver, expresado como una pregunta que inspira soluciones creativas.',
    comoSeUsa: `Para cada desafío, completá los 4 componentes del template: la Acción (qué vas a hacer), el Usuario (para quién), el Contexto o restricciones (en qué marco), y el Resultado esperado (qué beneficio o outcome). Podés agregar constraints adicionales y criterios de éxito para que el equipo sepa qué tipo de soluciones son válidas y cómo medir si el desafío fue resuelto. Con al menos 1 desafío con acción y usuario completos podés generar el análisis AI.`,
    cuandoUsarlo: `Al inicio de un proyecto de diseño para establecer el scope del problema. Después del research y la síntesis, cuando tenés insights claros sobre qué resolver. Usalo para alinear expectativas con stakeholders antes de idear, y como referencia constante durante el desarrollo para evaluar si las soluciones abordan el desafío definido. También cuando tenés múltiples problemas y necesitás priorizar uno.`,
    ejemplo: `Acción: "ayudar a tomar medicamentos a tiempo". Usuario: "pacientes crónicos". Contexto: "dentro de su rutina diaria, sin añadir nuevos dispositivos". Resultado: "para mejorar la adherencia al tratamiento en un 30%". Enunciado: "¿Cómo podemos ayudar a pacientes crónicos a tomar sus medicamentos a tiempo dentro de su rutina diaria para mejorar su adherencia al tratamiento en un 30%?"`,
  },
  { codigo: 'from-to', nombre: 'From-To', descripcion: 'Herramienta de síntesis que visualiza la transformación entre el estado actual (From) y el estado futuro deseado (To), revelando las brechas que el diseño debe cerrar.', comoSeUsa: 'Revisá los hallazgos de investigación y definí el estado actual en términos concretos y específicos (qué hace el usuario, cuánto tarda, qué dolores tiene). Para cada item del estado actual, definí el estado futuro deseado — qué experiencia, qué velocidad, qué beneficio. Documentá también el contexto actual (párrafo que describe la situación) y la visión de futuro (párrafo que describe el estado deseado). Con los pares FROM-TO listos, buscá patrones: ¿apuntan todos a la misma visión? ¿Hay contradicciones? ¿Cuáles son las brechas más difíciles de cerrar?', cuandoUsarlo: 'En la fase de Define, después de completar la investigación y antes de pasar a ideación. Cuando necesitás comunicar la visión del producto a stakeholders. Para validar que las soluciones que generás van en la dirección correcta. Ideal cuando tenés múltiples pain points identificados y querés priorizarlos en función del gap que representan.' },
  {
    codigo: 'insights-cluster',
    nombre: 'Insights Cluster',
    descripcion: 'Agrupación temática de hallazgos de investigación para identificar patrones y oportunidades.',
    comoSeUsa: `Creá clusters temáticos (grupos de insights) basados en los patrones que emergen de la investigación. En cada cluster escribí los insights que lo componen, asignando un nivel de impacto (alto/medio/bajo) a cada uno. Un cluster debe tener un nombre claro que capture la temática compartida. Con al menos 2 clusters con insights podés generar el análisis AI.`,
    cuandoUsarlo: `Cuando terminás una fase de investigación y tenés muchos datos sueltos que necesitás organizar. Para workshops de síntesis donde el equipo necesita converger en los temas más importantes. También cuando debés presentar findings de research a stakeholders de forma estructurada, priorizando los clusters de mayor impacto.`,
    ejemplo: `Cluster "Facilidad de Uso" (impacto alto): los usuarios no encuentran el botón de checkout / la navegación es confusa para nuevos usuarios. Cluster "Confianza" (impacto alto): los usuarios dudan en ingresar datos de tarjeta / falta información de seguridad visible.`,
  },
  {
    codigo: 'key-facts',
    nombre: 'Key Facts',
    descripcion: 'Recopilación de los datos y hechos más relevantes descubiertos durante la investigación.',
    comoSeUsa: `Revisá toda la investigación disponible (entrevistas, encuestas, analytics, session recordings). Por cada hecho clave, documentá: el dato concreto y verificable, la fuente de donde proviene, y la implicación — qué debería hacer el equipo con ese dato. Un Key Fact es "lo que pasó", no "lo que significa": debe ser específico, verificable y accionable. Con al menos 3 hechos cargados podés generar el análisis AI.`,
    cuandoUsarlo: `Cuando terminás una fase de investigación y necesitás cristalizar los hallazgos más importantes antes de pasar a la síntesis. Para presentar resultados de research a stakeholders que necesitan datos concretos, no interpretaciones. También para validar decisiones de diseño con evidencia, o para alinear al equipo sobre qué es un hecho verificado vs qué es una hipótesis.`,
    ejemplo: `Hecho: "El 68% de usuarios abandona el checkout antes de completar". Fuente: Analytics (3 meses). Implicación: Priorizar optimización del flujo de checkout como primera iniciativa del roadmap.`,
  },
  {
    codigo: 'mapa-activo-experiencia',
    nombre: 'Mapa Activo de la Experiencia',
    descripcion: 'Representación visual de la experiencia del usuario destacando momentos clave, emociones y oportunidades de mejora.',
    comoSeUsa: `Definí el contexto general de la experiencia a mapear (qué producto, servicio o proceso estás analizando). Creá las etapas del journey en orden cronológico. Por cada etapa, documentá: las acciones que realiza el usuario, los touchpoints con los que interactúa, el momento clave más significativo de esa etapa, y las oportunidades de mejora que identificás. Con al menos 2 etapas completas podés generar el análisis AI.`,
    cuandoUsarlo: `Cuando necesitás visualizar y analizar la experiencia completa del usuario con un producto o servicio. Especialmente útil en la fase de Definición para sintetizar hallazgos de investigación o en Desarrollo para identificar dónde intervenir con nuevas ideas. Usalo cuando el equipo necesita alinearse sobre cuál es la experiencia actual antes de diseñar la futura.`,
    ejemplo: `Etapa "Onboarding": Acciones: descarga la app, completa el registro, explora funcionalidades. Touchpoints: email de bienvenida, pantalla de tutorial, notificación push. Momento clave: primera vez que completa una tarea exitosamente. Oportunidades: reducir pasos en el registro, personalizar el tutorial según el perfil.`,
  },
  {
    codigo: 'mapa-evolucion-innovacion',
    nombre: 'Mapa de Evolución e Innovación',
    descripcion: 'Visualización de la evolución de un producto o servicio y las oportunidades de innovación futuras.',
    comoSeUsa: `Definí la industria o producto a analizar y agregá un contexto opcional. Creá eras cronológicas (por ejemplo: "Era Analógica", "Era Digital", "Era IA"). En cada era registrá los hitos más importantes clasificándolos por tipo de innovación (incremental, disruptiva, arquitectural, radical), los puntos de inflexión que marcaron el quiebre de esa era, y las oportunidades o gaps que dejó sin resolver. Con al menos 2 eras mapeadas podés generar el análisis AI.`,
    cuandoUsarlo: `Cuando necesitás entender el contexto histórico de una industria antes de innovar. Para identificar patrones de disrupción que se repiten. Cuando el equipo necesita fundamentar por qué ahora es el momento correcto para una idea. También útil para comunicar la visión del producto situándola dentro de una narrativa de evolución histórica.`,
  },
  {
    codigo: 'matriz-2x2',
    nombre: 'Matriz 2x2',
    descripcion: 'Herramienta de priorización que clasifica elementos en 4 cuadrantes según dos criterios definidos.',
    comoSeUsa: `Definí los dos ejes de tu matriz (ej: Esfuerzo y Impacto). Agregá los ítems a priorizar (features, problemas, iniciativas) y ubicalos en la combinación de valores que mejor los describe (alto/bajo en cada eje). Con al menos 3 ítems podés generar el análisis AI que interpreta la distribución y recomienda qué priorizar.`,
    cuandoUsarlo: `Cuando tenés muchos ítems y necesitás decidir en qué enfocarte. Ideal para roadmap planning, priorización de features, decisiones de diseño con múltiples opciones, o workshops con stakeholders donde necesitás llegar a un consenso sobre prioridades. Las matrices más comunes son Impacto-Esfuerzo, Urgencia-Importancia, y Valor-Complejidad.`,
    ejemplo: `Matriz Impacto-Esfuerzo: "Notificaciones push" (Alto Impacto / Bajo Esfuerzo = Quick Win), "Checkout redesign" (Alto Impacto / Alto Esfuerzo = Apuesta Estratégica), "Dark mode" (Bajo Impacto / Bajo Esfuerzo = Postergar).`,
  },
  { codigo: 'matriz-tendencias', nombre: 'Matriz de Tendencias', descripcion: 'Herramienta de síntesis estratégica que clasifica tendencias tecnológicas, sociales, económicas, regulatorias y de mercado según su impacto (alto/bajo) y plazo (corto/largo), generando cuatro cuadrantes de acción: Ahora, Futuro, Monitorear e Ignorar.', comoSeUsa: 'Revisá los hallazgos de investigación y listá las tendencias identificadas. Para cada tendencia, evaluá su nivel de impacto en usuarios o negocio (alto o bajo) y su timeline estimado (corto o largo plazo). Clasificalas en los 4 cuadrantes: AHORA (alto impacto + corto plazo): priorizar e implementar ya; FUTURO (alto impacto + largo plazo): invertir y prepararse; MONITOREAR (bajo impacto + largo plazo): hacer seguimiento periódico; IGNORAR (bajo impacto + corto plazo): no asignar recursos. Buscá patrones entre tendencias del mismo cuadrante y cruzá cuadrantes para identificar relaciones estratégicas.', cuandoUsarlo: 'Después de completar investigación de mercado o de usuarios y antes de priorizar el roadmap. En strategic planning para alinear al equipo sobre qué tendencias importan. Al entrar a un nuevo mercado para entender el panorama competitivo. Ideal cuando tenés 5 o más tendencias identificadas y necesitás priorizarlas para el diseño.' },
  {
    codigo: 'metafora-problema',
    nombre: 'Metáfora del Problema',
    descripcion: 'Uso de analogías y metáforas para reencuadrar el problema y generar nuevas perspectivas.',
    comoSeUsa: `Definí el problema original con claridad. Luego explorá distintas metáforas que lo representen: ¿A qué se parece esto en el mundo físico, en la naturaleza, en la vida cotidiana, o en otro dominio? Para cada metáfora documentá el título (el enunciado de la analogía), el tipo de metáfora, una descripción que la elabore, y los insights que te genera (¿qué perspectivas nuevas revela?). Con al menos 1 metáfora completa con título e insights podés generar el análisis AI, que evalúa la fertilidad de cada metáfora y recomienda cuál usar. Finalmente, anotá la metáfora seleccionada para comunicar el problema al equipo y stakeholders.`,
    cuandoUsarlo: `Después de definir el problema y antes de la fase de ideación. Cuando el equipo está "demasiado dentro" del problema y necesita perspectiva externa. Para comunicar el problema a stakeholders no técnicos de forma memorable. También cuando las soluciones propuestas son todas variaciones de lo mismo — la metáfora ayuda a salir del patrón. Ideal en workshops donde se necesita generar empatía colectiva con el problema antes de idear.`,
    ejemplo: `Problema: "Los usuarios no completan el onboarding de la app". Metáfora 1: "Como perder las llaves cada vez que salís" (tipo: vida cotidiana) — Insight: el usuario sabe que tiene que salir pero no puede porque falta algo; necesitamos "preparar las llaves antes de salir". Metáfora 2: "Como aprender a andar en bici con el manual de instrucciones" (tipo: vida cotidiana) — Insight: el onboarding actual es teórico cuando debería ser práctico desde el primer segundo. Metáfora seleccionada: "Nuestro onboarding es como aprender a andar en bici leyendo un manual — funciona en papel pero no en la práctica".`,
  },
  { codigo: 'poems', nombre: 'POEMS', descripcion: 'Framework de síntesis que organiza observaciones de campo en cinco dimensiones: People, Objects, Environments, Messages y Services.', comoSeUsa: 'Revisá toda la investigación recopilada (observaciones, entrevistas, fotos, notas). Clasificá cada observación en una de las 5 dimensiones POEMS. Documentá las observaciones crudas tal cual las encontraste — sin interpretarlas todavía. Una vez cargadas todas las dimensiones, buscá patrones entre ellas. Identificá tensiones y contradicciones entre dimensiones. Generá el análisis IA para obtener insights cruzados y oportunidades de diseño.', cuandoUsarlo: 'Después de completar la fase de investigación y antes de definir el problema. Cuando tenés muchas observaciones dispersas y necesitás organizarlas para encontrar patrones. Ideal cuando investigaste con múltiples métodos (entrevistas, shadowing, safari) y necesitás un framework que unifique los hallazgos.', ejemplo: 'People: empleados manipulan la impresora con mucha confianza aunque esta falla seguido. Objects: la impresora tiene un cartel manuscrito con instrucciones para "reiniciarla bien". Environment: la sala de impresión es angosta y sin ventanas, generando aglomeración en horarios pico. Messages: el cartel oficial dice "no tocar los ajustes" pero el cartel manuscrito contradice eso. Services: el soporte técnico tarda 48 horas — mientras tanto, los usuarios improvisan soluciones propias.' },
  {
    codigo: 'pov',
    nombre: 'POV (Point of View)',
    descripcion: 'Declaración que articula el punto de vista del diseñador sobre el usuario, su necesidad y el insight descubierto.',
    comoSeUsa: `Definí el contexto de la investigación (con quién hablaste, qué estudiaste). Para cada segmento o persona relevante, completá los 3 componentes del POV: el usuario (quién es, con datos específicos del research), la necesidad (qué necesita o quiere lograr), y el insight (por qué es importante — la razón sorprendente o no obvia que descubriste en la investigación). Podés crear múltiples POVs para distintos segmentos o tensiones. Con al menos 1 POV completo podés generar el análisis AI, que incluye derivación automática de preguntas How Might We.`,
    cuandoUsarlo: `Después de la fase de investigación (Discover) y antes de empezar a idear (Develop). Es el puente entre "qué aprendimos" y "qué problema vamos a resolver". Usalo para alinear al equipo sobre el usuario y la necesidad central, para comunicar el problema a stakeholders, y como referencia constante durante el diseño para validar que las soluciones responden al POV definido.`,
    ejemplo: `Usuario: "María, emprendedora freelance de 32 años que maneja sus clientes desde el celular". Necesidad: "poder crear y enviar facturas profesionales en menos de 2 minutos". Insight: "porque actualmente pierde hasta el 30% de sus clientes al no poder facturar en el momento — los clientes interpretan la demora como falta de profesionalismo".`,
  },

  // Develop > Idear
  {
    codigo: 'brainstorming',
    nombre: 'Brainstorming',
    descripcion: 'Técnica de generación de ideas en grupo donde se busca producir la mayor cantidad posible sin juzgarlas.',
    comoSeUsa: `Definí el reto o pregunta de brainstorming ("¿Cómo podríamos…?"). Elegí la técnica (clásico, worst-possible-idea, SCAMPER, brainwriting o sketching) y el número de participantes. Durante la sesión, cargá todas las ideas generadas — podés asignar un cluster o categoría a cada idea para agruparlas temáticamente. Después de la sesión, registrá los votos que recibió cada idea (dot voting). Marcá las ideas ganadoras en el campo "Top Ideas". Con el reto definido y al menos 3 ideas podés generar el análisis AI, que evalúa la calidad de la sesión, analiza las top ideas, identifica patrones en los clusters, y detecta ideas innovadoras que merecen más exploración.`,
    cuandoUsarlo: `Cuando el equipo está definiendo cómo resolver un problema y necesita explorar múltiples direcciones antes de comprometerse con una solución. Al inicio de la fase de ideación (Develop), después de haber definido claramente el problema. También cuando hay bloqueos creativos o cuando el equipo está atascado en una sola dirección de solución. Ideal como primer paso antes del Mapa de Convergencia, donde se filtran y priorizan las ideas generadas.`,
    ejemplo: `Reto: "¿Cómo podríamos reducir el abandono en el checkout de nuestra app?". Técnica: Clásico. 6 participantes. Ideas generadas (32): agregar progress bar, checkout en 1 click, mostrar costos ocultos upfront, guest checkout, chat de soporte en tiempo real, envío gratis desde $X, suscripción mensual… Clusters: UX (10 ideas), Payment (8 ideas), Pricing (7 ideas), Support (7 ideas). Top ideas por votos: "Checkout en 1 click" (15 votos), "Mostrar costos ocultos upfront" (12 votos), "Guest checkout" (10 votos).`,
  },
  {
    codigo: 'disenio-escenarios',
    nombre: 'Diseño de Escenarios',
    descripcion: 'Técnica que crea narrativas detalladas sobre cómo un usuario interactúa con un producto o servicio en situaciones específicas, incluyendo contexto emocional y situacional — no solo qué hace el usuario, sino cómo se siente.',
    comoSeUsa: '1. Definí el contexto general del producto o servicio. 2. Creá un escenario por situación: definí quién es el usuario, dónde está, cuándo usa el producto y qué quiere lograr. 3. Elegí el tipo: happy path, edge case, error, contextual o day-in-life. 4. Escribí el flujo paso a paso: acción del usuario + emoción en cada paso. 5. Identificá oportunidades de diseño derivadas del escenario.',
    cuandoUsarlo: 'Para diseñar flujos de usuario en contextos realistas. Para identificar pain points emocionales, no solo funcionales. En prototipado de servicios. Para comunicar al equipo cómo se usa el producto en situaciones reales. Cuando necesitás validar soluciones en diferentes contextos de uso.',
    ejemplo: 'María, 32 años, diseñadora freelance. Oficina de coworking, 7:15pm. Abre la app de delivery, filtra por vegano (alivio), elige restaurante (satisfacción), paga con Apple Pay (confianza), espera (ansiedad: ¿cuánto falta?), recibe pedido con 3 minutos de demora (frustración). Oportunidad: notificar proactivamente cuando hay demoras y mostrar actualización del tiempo en vivo.',
  },
  {
    codigo: 'hibridacion-agregacion',
    nombre: 'Hibridación por Agregación',
    descripcion: 'Técnica de combinación de ideas donde se agregan elementos de diferentes conceptos para crear uno nuevo.',
    comoSeUsa: `1. Identificá 2-3 ideas prometedoras que ya existen o fueron generadas en sesiones previas. 2. Para cada idea, listá sus elementos o features principales. 3. Elegí la técnica de agregación: Feature Stacking (sumar features), Best of Each (lo mejor de cada idea), Plus/Minus (agregar y quitar), o Mashup (combinar productos/servicios). 4. Documentá las combinaciones más interesantes: qué elemento de la idea A + qué elemento de la idea B = qué resultado nuevo. 5. Describí la idea híbrida resultante como si fuera una propuesta completa. 6. Articulá la propuesta de valor: ¿por qué la híbrida es mejor que cada idea por separado?`,
    cuandoUsarlo: `Durante sesiones de ideación cuando hay ideas parciales que son prometedoras pero ninguna es completa por sí sola. Cuando el equipo tiene varias propuestas y quiere explorar si combinarlas genera más valor. Para crear propuestas de valor únicas que diferencien el producto en el mercado. En workshops de innovación donde se comparan soluciones de diferentes industrias y se quiere trasladar lo mejor de cada una. No usar cuando las ideas son tan distintas en naturaleza que su combinación generaría complejidad sin beneficio real.`,
    ejemplo: `Equipo de productividad combinando Todoist (gestión de tareas) + Notion (base de datos flexible) + Google Calendar (gestión de tiempo). Combinaciones: "tareas + base de datos" → tareas organizadas en vistas personalizables (kanban, tabla, lista). "tareas + calendario" → bloqueo automático de tiempo para cada tarea según su prioridad y deadline. Idea híbrida: app que permite crear tareas, organizarlas en bases de datos personalizables y automáticamente bloquear tiempo en el calendario para cada una. El usuario ve sus tareas, proyectos y tiempo en una sola vista. Propuesta de valor: elimina el triple-booking entre lista de tareas, notas y calendario que obliga a los usuarios a usar 3 apps distintas hoy.`,
  },
  {
    codigo: 'hibridacion-sintesis',
    nombre: 'Hibridación por Síntesis',
    descripcion: 'Técnica de innovación disruptiva donde se funden las esencias de dos o más conceptos para crear algo cualitativamente nuevo que no existiría sin la combinación. Es el nivel más profundo de hibridación.',
    comoSeUsa: '1. Identificá dos o más conceptos base y describí su esencia (no lo que son, sino qué principio los hace funcionar). 2. Encontrá los puntos de conexión y tensión creativa entre ellos. 3. Determiná el nivel de síntesis: superficial (combina features), estructural (cambia la arquitectura) o paradigmático (crea nuevo modelo mental). 4. Describí la idea sintetizada: lo que emerge cualitativamente nuevo de la fusión. 5. Nombrá el nuevo paradigma si aplica.',
    cuandoUsarlo: 'Cuando se busca innovación disruptiva que cree una nueva categoría. Cuando las soluciones incrementales no son suficientes. Para business model innovation. Cuando hay dos mundos o industrias con tensión creativa que nadie ha fusionado aún.',
    ejemplo: 'Concepto 1: Universidad (esencia: credencial de conocimiento + comunidad de práctica). Concepto 2: Videojuego RPG (esencia: progresión visible + status social + recompensas inmediatas). Síntesis: plataforma donde las credenciales académicas son logros coleccionables ligados a proyectos reales, con rankings por industria y guild de mentores — no es una universidad gamificada, es un nuevo modelo de certificación profesional.',
  },
  {
    codigo: 'hibridacion-traslacion',
    nombre: 'Hibridación por Traslación',
    descripcion: 'Técnica donde se trasladan conceptos exitosos de un dominio a otro para generar soluciones innovadoras.',
    comoSeUsa: `1. Definí claramente el problema a resolver y el contexto en que opera. 2. Explorá otros dominios buscando quién más tiene el mismo problema: industrias similares, industrias completamente diferentes, la naturaleza (biomímesis), vida cotidiana, o tecnología de otro campo. 3. Para cada dominio, identificá no la solución superficial sino el MECANISMO SUBYACENTE que la hace funcionar. 4. Documentá cómo resuelven el problema allá, con detalle. 5. Traducí ese mecanismo al contexto actual: ¿cómo se adaptaría? ¿qué cambiaría? 6. Identificá el mecanismo clave central de la traslación. 7. Describí la idea resultante completa que surge de aplicar el mecanismo trasladado.`,
    cuandoUsarlo: `En sesiones de ideación cuando el equipo está bloqueado y las soluciones generadas son siempre "más de lo mismo". Cuando se necesita diferenciación competitiva real y las mejoras incrementales no son suficientes. Para desafiar assumptions trasladando lógicas exitosas de otras industrias. Cuando el problema ya fue resuelto de forma brillante en otro contexto y se puede aprender de eso. Ideal después de una investigación de campo o benchmarking donde se identificaron ejemplos de otras industrias.`,
    ejemplo: `Problema: los programas de fidelización de ecommerce no generan engagement real. Traslación desde Juegos MMORPG — mecanismo: sistema de progresión con niveles visibles, logros desbloqueables y status social. Traducción: en lugar de "puntos canjeables", el usuario tiene un "nivel de miembro" que sube con compras y desbloquea beneficios exclusivos no disponibles para otros. "Logros" por comportamientos específicos (primera compra, compra en aniversario, referido amigo). Perfil con badges de logros visibles. Idea resultante: programa de fidelización donde los usuarios no compran solo por descuentos sino por progresión y status — generando engagement similar al de los juegos.`,
  },
  {
    codigo: 'mapa-convergencia',
    nombre: 'Mapa de Convergencia',
    descripcion: 'Herramienta para filtrar y converger ideas hacia las soluciones más prometedoras.',
    comoSeUsa: `Definí el contexto de la sesión (de qué brainstorming provienen las ideas). Establecé los criterios de convergencia que usará el equipo (ej: viabilidad técnica, valor para el usuario, diferenciación). Cargá todas las ideas y clasificalas con tres estados: Activa (en evaluación), Seleccionada (avanza al prototipo) o Descartada (no avanza por ahora). Para las descartadas, podés agregar la razón del descarte — es útil para futuras iteraciones. Con al menos 1 idea seleccionada podés generar el análisis AI, que evalúa la calidad de la selección, identifica patrones en las decisiones, y señala ideas descartadas que merecen revisión.`,
    cuandoUsarlo: `Después de una sesión de brainstorming o ideación donde generaron muchas ideas y necesitás priorizarlas. Antes de pasar a prototipar — el Mapa de Convergencia documenta por qué el equipo eligió las ideas que eligió. También útil para comunicar a stakeholders cómo se llegó a la selección final, mostrando que se evaluaron múltiples opciones.`,
    ejemplo: `Sesión de brainstorming con 47 ideas para feature de notas inteligentes. Criterios: viabilidad técnica, impacto en retención, diferenciación. Seleccionadas (3): "Voz a texto integrado" (viabilidad alta, impacto alto), "AI que resume notas" (viabilidad media, impacto alto), "Compartir con equipo" (viabilidad alta, impacto medio). Descartadas: "Notas colaborativas en tiempo real" (razón: muy complejo para MVP), "Integración con otras apps" (razón: scope creep).`,
  },
  {
    codigo: 'seleccion-ideas',
    nombre: 'Selección de Ideas',
    descripcion: 'Proceso estructurado para evaluar y seleccionar las mejores ideas generadas durante la ideación.',
    comoSeUsa: `1. Definí el contexto y el objetivo de la selección. 2. Elegí el método de evaluación (scorecard ponderado, dot voting, matriz impacto-esfuerzo, etc.). 3. Definí los criterios de evaluación con sus pesos (ej: viabilidad 30%, impacto 40%, diferenciación 30%). 4. Listá todas las ideas a evaluar. 5. Puntuá cada idea de 1 a 5 en cada criterio. 6. El scorecard calcula el score ponderado automáticamente. 7. Clasificá cada idea como seleccionada, en backlog o descartada. 8. Documentá la decisión final y los siguientes pasos para las ideas seleccionadas.`,
    cuandoUsarlo: `Después de una sesión de brainstorming o ideación donde generaron múltiples ideas y necesitás priorizarlas antes de prototipar. Cuando el equipo tiene desacuerdo sobre qué ideas continuar y necesitás un proceso objetivo para decidir. Antes de presentar a stakeholders cuáles ideas se van a desarrollar — el proceso documentado muestra rigor en la toma de decisiones. También útil cuando los recursos son limitados y hay que elegir entre pocas opciones con criterios claros.`,
    ejemplo: `Equipo de producto evaluando 6 ideas de features nuevos con criterios: impacto en usuario (peso 40%), viabilidad técnica (peso 35%), diferenciación (peso 25%). Idea "Modo offline" — scores: impacto 5, viabilidad 3, diferenciación 4 → score ponderado 4.0. Idea "AI assistant" — scores: impacto 4, viabilidad 2, diferenciación 5 → score ponderado 3.45. Seleccionadas: "Modo offline" (score 4.0, alta viabilidad), "Templates prediseñados" (score 3.8). En backlog: "AI assistant" (re-evaluar en Q3 cuando la infra esté lista). Decisión documentada: priorizar funcionalidades de confiabilidad sobre innovación para este trimestre.`,
  },
  {
    codigo: 'sesion-cocreacion',
    nombre: 'Sesión de Cocreación',
    descripcion: 'Taller donde usuarios, stakeholders y el equipo de diseño trabajan juntos como co-creadores activos para generar soluciones. El usuario no es solo sujeto de investigación — es co-creador del producto.',
    comoSeUsa: '1. Definí el objetivo: qué van a crear o resolver juntos. 2. Seleccioná participantes: usuarios target + equipo + stakeholders mezclados. 3. Ejecutá las fases: warm-up (30min), context setting con findings (30min), generación de ideas en grupos (30min), prototipado colaborativo (60min), presentaciones y feedback (30min). 4. Documentá cada idea con su grupo origen y los votos que recibió. 5. Marcá las ideas que el grupo eligió avanzar. 6. Registrá las decisiones y aprendizajes del proceso.',
    cuandoUsarlo: 'Para construir ownership con stakeholders. Cuando el problema es complejo y tiene múltiples perspectivas. Para validar conceptos antes de invertir en desarrollo. Para generar ideas más creativas que las que el equipo solo puede crear. En las fases de Develop (generar ideas) y Define (validar conceptos con usuarios reales).',
    ejemplo: 'Fintech quiere mejorar onboarding de app de pagos. 8 usuarios + 3 del equipo + 1 stakeholder. Técnica 6-3-5 en grupos de 3. Ideas resultantes: Reto de Ahorro (gamificar con niveles, 12 votos ★), Redondeo Automático (10 votos), Meta Visual con ilustración (8 votos). Decisión: prototipar combinación de Reto de Ahorro + Redondeo. Los usuarios se sienten owners porque ellos lo crearon.',
  },
  {
    codigo: 'what-if',
    nombre: 'What If',
    descripcion: 'Técnica de ideación que plantea preguntas hipotéticas para explorar posibilidades no convencionales.',
    comoSeUsa: `1. Establecé el contexto: qué estás diseñando y cuál es el reto. 2. Generá preguntas hipotéticas "¿Qué pasaría si…?" sin filtro — apuntá a 10-20 preguntas. 3. Variá los tipos: inversión (eliminar algo existente), extremo (llevar algo al límite), tecnológico (nueva tech disponible), usuario (cambiar quién lo usa), competitivo (qué haría la competencia), contextual (cambiar el entorno). 4. Para cada pregunta explorada, anotá las implicaciones de ese escenario. 5. Seleccioná las 3-5 preguntas más interesantes para prototipar o validar.`,
    cuandoUsarlo: `Cuando el equipo siente que está atascado en las mismas soluciones y necesita salir del pensamiento incremental. En sesiones de ideación para desafiar assumptions que se dan por sentados. Antes de un sprint de innovación para generar nuevas direcciones a explorar. Cuando necesitás diferenciación competitiva y las mejoras iterativas no son suficientes. No usar cuando los constraints son muy rígidos (legales, técnicos inamovibles) o cuando solo se buscan mejoras incrementales.`,
    ejemplo: `Equipo diseñando app de banking para millennials. What Ifs generados: "¿Y si no existieran passwords?" → Login biométrico, magic links, trust score basado en comportamiento. "¿Y si fuera completamente gratis?" → Modelo B2B donde las empresas pagan. "¿Y si funcionara sin internet?" → Modo offline con sincronización posterior. "¿Y si el usuario pudiera prestar dinero a amigos?" → P2P lending integrado. Seleccionadas para prototipar: "sin passwords" (diferenciación alta, viabilidad alta) y "prestar a amigos" (nuevo modelo de negocio). Insight derivado: la mayor fricción no está en las features sino en la confianza y el acceso.`,
  },

  // Develop > Prototipar
  {
    codigo: 'mvp',
    nombre: 'MVP',
    descripcion: 'El MVP (Mínimo Producto Viable) es la versión más simple de un producto que puede ser lanzada para validar una hipótesis de negocio. Tiene el conjunto mínimo de features necesario para resolver el problema core del usuario y obtener feedback. Su objetivo no es tener un producto perfecto, sino aprender rápido qué funciona.',
    comoSeUsa: 'Proceso: (1) Definir la hipótesis — qué quieres validar; (2) Identificar core feature — una sola cosa que funcione; (3) Priorizar con la matriz valor/esfuerzo — Alto valor + Bajo esfuerzo = MVP, Alto valor + Alto esfuerzo = Later, Bajo valor + Bajo esfuerzo = Mandatory, Bajo valor + Alto esfuerzo = Drop; (4) Build — rápido y simple; (5) Launch — obtener usuarios reales; (6) Learn — medir y iterar. Tipos de MVP: Wizard of Oz (humanos simulan el sistema), Concierge (servicio manual primero), Landing + Email (validar interés), Crowdfunding (video prototipo), Feature MVP (solo el core feature).',
    cuandoUsarlo: 'En Develop para validar el negocio rápido antes de comprometer recursos en desarrollo completo. Para launch temprano y aprender con usuarios reales. Cuando los recursos son limitados y se necesita validar product-market fit. Para reducir el riesgo de buildear algo que nadie quiere.',
    ejemplo: 'Caso: Validar app de delivery de comida. MVP tradicional (equivocado): app con lista de restaurantes, carrito, checkout, tracking y panel para restaurantes — 3 meses de desarrollo antes de validar. MVP smarter (correcto): landing page con lista de 5 restaurantes + pedidos por WhatsApp + fulfillment manual. En 2 semanas validaron: ¿la gente ordena online?, ¿cuánto pagan?, ¿qué tipo de comida prefieren?. Aprendizaje: el delivery era menos importante que la falta de opciones saludables en la zona. Pivotaron el negocio antes de invertir en desarrollo.',
  },
  {
    codigo: 'prototipo-empatizar',
    nombre: 'Prototipo para Empatizar',
    descripcion: 'Herramienta de design thinking que crea representaciones tangibles o digitales del producto con el único propósito de entender las necesidades, emociones y contexto del usuario. No busca validar funcionalidad sino generar empatía real.',
    comoSeUsa: '1. Definí el objetivo de empatía: qué querés que el equipo sienta o comprenda. 2. Elegí el tipo de prototipo: role-play (actuar la experiencia), bodystorming (prototipar con el cuerpo), environmental (recrear el entorno físico), experiencial (vivir la experiencia completa). 3. Construí el prototipo rápido y simple — no busques fidelidad, buscá inmersión. 4. Documentá los pasos de la sesión con las observaciones de cada momento. 5. Registrá insights emocionales (qué sintió el equipo), fricciones identificadas y supuestos que querés validar o refutar. 6. Usá el análisis IA para convertir lo vivido en implicaciones de diseño concretas.',
    cuandoUsarlo: 'Antes de diseñar soluciones en la fase de Develop cuando el equipo cree que entiende al usuario pero no lo ha vivido. Cuando hay disconnect entre lo que el equipo imagina y lo que el usuario experimenta. En investigación de nuevos dominios donde el equipo no tiene experiencia directa con el problema. Para validar que los assumptions del equipo sobre el usuario son correctos antes de invertir en desarrollo. Especialmente útil cuando el usuario tiene contextos de uso que el equipo no vive habitualmente (adultos mayores, personas con discapacidades, contextos de estrés o emergencia).',
    ejemplo: 'Equipo diseñando checkout para adultos mayores. Tipo: experiencial. Objetivo: sentir la frustración de completar un formulario con limitaciones motoras y visuales. Pasos: (1) Colocarse gafas que reducen visión periférica, (2) usar guantes para simular limitación motora fina, (3) completar el checkout con ruido de fondo y presión de tiempo. Insights emocionales: "la ansiedad del timeout del sesión genera errores que no tienen nada que ver con la UI". Fricciones: botones de 24px son imposibles con guantes, múltiples campos de verificación de tarjeta abruman. Supuesto refutado: "el problema es el número de pasos" → en realidad el problema es la densidad de información en cada paso, no la cantidad de pasos.',
  },
  {
    codigo: 'prototipo-fisico',
    nombre: 'Prototipo Físico',
    descripcion: 'Representación tangible del producto usando materiales físicos como cartón, foam, madera balsa, impresión 3D o resina. Permite testear forma, tamaño, ergonomía, peso, textura y respuesta física del usuario — cosas que no se pueden replicar en pantalla. La regla de oro: usar siempre el material más barato posible para la pregunta que se quiere responder.',
    comoSeUsa: '1. Definir qué se quiere validar: no "si el producto es bueno" sino preguntas específicas — "¿es cómodo sostenerlo con una mano?", "¿el mecanismo de apertura es intuitivo?". 2. Elegir el material según la fidelidad necesaria: cartón (2 horas, muy bajo costo) para validar forma básica, foam (medio día) para textura y forma definida, madera balsa para detalles estructurales, impresión 3D para formas complejas con mecanismos, resina para acabado near-production. 3. Fabricar el prototipo con el material elegido. 4. Testear con usuarios reales en el contexto real de uso. 5. Documentar hallazgos específicos — qué funcionó, qué falló, qué sorprendió. 6. Subir fidelidad solo cuando la iteración anterior confirmó que la dirección es correcta — nunca escalar a impresión 3D si el cartón todavía tiene preguntas abiertas.',
    ejemplo: 'Diseño de dispensador de jabón para baño público. Iteración 1 (Cartón, 2 horas): forma cilíndrica básica — test: ¿es cómodo sostenerlo? Resultado: el diámetro era demasiado grande para mano promedio. Iteración 2 (Foam, 1 día): forma más delgada y con grip — test: ¿es fácil de recargar con manos mojadas? Hallazgo: la tapa superior requería dos manos. Iteración 3 (Impresión 3D, 1 semana): mecanismo de palanca funcional — test con agua real: ¿el ángulo de dispensación genera salpicaduras? Hallazgo crítico: 15° de ajuste en el ángulo eliminaron el 90% del splash. Decisión: ajustar ángulo y textura del grip antes de fabricar molde. Costo total: $200 en materiales vs $50,000 en moldes de producción.',
  },
  {
    codigo: 'prototipo-funcional',
    nombre: 'Prototipo Funcional',
    descripcion: 'Representación del producto que realmente "funciona", permitiendo a usuarios completar tareas reales con comportamiento automático. Es un paso más allá de los mockups interactivos porque tiene lógica real, no solo navegación. Permite testear no solo la usabilidad sino también la viabilidad técnica del producto.',
    comoSeUsa: 'Proceso: (1) Definir flujos críticos — qué debe funcionar exactamente; (2) Priorizar features — solo lo esencial para el testing; (3) Desarrollar el prototipo con las herramientas elegidas (Figma+ProtoPie, Vercel, Firebase, FlutterFlow, etc.); (4) Testear con usuarios reales ejecutando tareas concretas; (5) Registrar hallazgos funcionales y de UX; (6) Iterar corrigiendo bugs y mejoras. Tipos: MVP (lanzamiento inicial), Pilot (versión limitada en producción), Beta (validación amplia), Feature Flag (funcionalidad toggled para testing gradual).',
    cuandoUsarlo: 'En la fase de Develop cuando se necesita validación técnica real, no solo de usabilidad. Para pasar de diseño a desarrollo y validar viabilidad técnica. En testing de usabilidad avanzado donde los usuarios deben completar tareas reales. Para validación de negocio antes de comprometer recursos en desarrollo completo.',
    ejemplo: 'Caso: Testear nueva funcionalidad de búsqueda en ecommerce. Desarrollo del prototipo con API básica + frontend funcional + 50 productos de datos dummy. Testing con 10 usuarios en 3 tareas: buscar camisa azul bajo $50, buscar regalo para alguien runner, comparar 3 productos similares. Hallazgos funcionales: filtro de precio incorrecto, búsqueda no entiende sinónimos, resultados no ordenables por rating. Hallazgos UX: filtro de color poco visible, usuarios quieren reseñas en resultados, necesitan "guardar búsqueda". Resultado: 15 bugs/mejoras identificados antes del desarrollo completo, ahorrando semanas de iteración.',
  },
  {
    codigo: 'prototipo-mostrar',
    nombre: 'Prototipo para Mostrar',
    descripcion: 'Representación del producto diseñada específicamente para comunicar, presentar y obtener validación de stakeholders, clientes o usuarios. Su objetivo es contar una historia convincente sobre el producto y obtener buy-in. Es una herramienta de venta interna y externa.',
    comoSeUsa: '1. Definí la audiencia: quién va a ver la demo y qué los motiva. 2. Elegí el nivel: demo estático (screenshots), interactivo (clickable), video (flujo grabado) o MVP funcional. 3. Craftá el mensaje clave: qué querés que la audiencia recuerde en una sola oración. 4. Documentá el problema que resuelve con datos del dolor del usuario. 5. Listá los beneficios a destacar — siempre desde la perspectiva de la audiencia, no de las features. 6. Preparate para preguntas difíciles con respuestas listas. 7. Después de la presentación, documentá los resultados y el feedback recibido para el análisis.',
    cuandoUsarlo: 'En la fase de Develop para presentar a stakeholders y obtener aprobación de presupuesto o recursos. Para obtener buy-in de management antes de comprometer desarrollo. En pitches de ventas para mostrar el producto a potenciales clientes. Para validación con usuarios potenciales antes del desarrollo final. Cuando el equipo necesita alinear a múltiples stakeholders alrededor de una visión común del producto.',
    ejemplo: 'Startup presentando al board para conseguir presupuesto de desarrollo. Nivel: demo interactivo en Figma con interactividad. Mensaje clave: "Reducimos el abandono de checkout en un 40% para adultos mayores". Problema: el 62% de usuarios mayores de 60 años abandona el checkout de e-commerce por interfaces confusas. Beneficios: +40% conversión, -60% llamadas de soporte, ADA compliance. Q anticipadas: "¿por qué no usar X solución existente?" → "costo 10x vs nuestro approach". Resultado: board aprobó el budget con la condición de hacer un test con 50 usuarios reales primero.',
  },
  {
    codigo: 'prototipo-pensar',
    nombre: 'Prototipo para Pensar',
    descripcion: 'Herramienta de diseño que usa representaciones tangibles del producto para explorar, iterar y validar ideas antes de comprometer recursos en desarrollo. Se basa en el principio de "pensar con las manos" — externalizar pensamientos en formas visuales de forma deliberadamente rough y temporal.',
    comoSeUsa: '1. Definí la pregunta o hipótesis que querés responder con el prototipado. 2. Empezá con el tipo de prototipo más rápido: sketch en papel (5 min). 3. Para cada iteración: documentá el tipo (sketch, wireframe, storyboard, paper-prototype), la herramienta usada, la duración y los aprendizajes obtenidos. 4. Marcá como descartadas las iteraciones que llevaron a callejones sin salida — eso es evidencia valiosa. 5. Iterá en fidelidad creciente solo cuando la iteración anterior ya validó la dirección. 6. Registrá la decisión final y los próximos pasos. 7. Usá el análisis IA para sintetizar qué hipótesis se validaron o refutaron.',
    cuandoUsarlo: 'En la fase de Develop para explorar múltiples direcciones de solución antes de comprometer recursos en desarrollo. Cuando el equipo tiene desacuerdo sobre la mejor solución y necesita evidencia rápida. Antes de iniciar desarrollo cuando hay incertidumbre sobre la estructura de información, el flujo o la forma de la solución. En design sprints para validar ideas en días en lugar de semanas. Cuando el costo de equivocarse en código es alto — el prototipado para pensar reduce ese riesgo.',
    ejemplo: 'Equipo diseñando navegación de app de banking. Pregunta: ¿sidebar o bottom nav? Iteración 1 (sketch, 5 min): 3 estructuras en papel — descartada la navegación tipo hamburger por complejidad. Iteración 2 (wireframe en Balsamiq, 30 min): bottom nav vs sidebar, test rápido con 2 colegas — bottom nav ganó. Iteración 3 (Figma alta fidelidad, 2 horas): bottom nav con 5 ítems, clickable, test con 5 usuarios. Resultado: en 2 días se invalidaron 2 de 3 opciones. El equipo entró a desarrollo con confianza, con evidencia de que la solución funciona, sin haber escrito una línea de código.',
  },
  {
    codigo: 'prototipo-rapido',
    nombre: 'Prototipo Rápido',
    descripcion: 'Metodología de validación acelerada que combina la construcción de un prototipo con sesiones de testing estructuradas para obtener aprendizaje validado en el menor tiempo posible. Integra la elección de técnica (sketch, paper prototype, wizard of oz, clickable mockup o MVP), el diseño de las sesiones de testing con usuarios reales, el registro sistemático de feedback, y la toma de decisión fundamentada en datos: iterar, pivotar o avanzar a desarrollo.',
    comoSeUsa: '1. Definir la hipótesis central: ¿qué suposición crítica necesitás validar con este prototipo? Sé específico — no "si la gente quiere el producto" sino "si los usuarios pueden completar el flujo de onboarding en menos de 3 minutos sin ayuda". 2. Elegir la técnica según la hipótesis y el tiempo disponible: sketch (2 min) para validar conceptos, paper prototype (15 min) para flujos, wizard of oz (30 min) para simular el sistema, clickable mockup (1-2 hrs) para usabilidad, MVP code (1-2 días) para validación técnica. 3. Construir el prototipo con la mínima fidelidad necesaria — nunca más alta. 4. Realizar las sesiones de testing con usuarios reales: documentar usuario, resultado (éxito/parcial/fallo) y feedback textual. 5. Analizar la tasa de éxito y los patrones en el feedback. 6. Tomar la decisión: >80% éxito → avanzar, 60-80% → iterar con ajustes finos, 40-60% → iterar con cambios importantes, <40% → pivot serio.',
    cuandoUsarlo: 'Antes de invertir tiempo en desarrollo. Cuando el equipo necesita validar si una hipótesis de producto es correcta antes de buildear. En sprints de innovación cuando hay múltiples ideas y se necesita descartar rápido. Cuando hay feedback contradictorio del equipo sobre qué funcionalidad priorizar. Antes de presentar a inversores o stakeholders — validar primero con usuarios. Cuando la incertidumbre sobre si la solución funciona es alta y el costo de equivocarse es significativo.',
    ejemplo: 'Startup de delivery de medicamentos. Hipótesis: "los adultos mayores pueden usar nuestra app para pedir medicamentos sin asistencia". Técnica elegida: paper prototype (15 min, papel impreso con pantallas). 6 sesiones de testing con adultos mayores de 65+. Resultados: 2 éxitos, 3 parciales, 1 fallo — tasa de éxito 33%. Patrones en el feedback: "la letra es muy chica", "no entiendo qué hace este botón", "¿ya lo pedí o no?". Hipótesis refutadas: la interfaz actual no es intuitiva para este segmento. Decisión: pivot en el diseño — rediseñar la UI con tipografía grande, lenguaje simple y confirmación explícita antes de iniciar nuevo ciclo de testing.',
  },

  // Develop > Herramientas
  { codigo: 'concept-sketch', nombre: 'Concept Sketch', descripcion: 'Boceto rápido de un concepto de solución que comunica la idea principal de forma visual.' },
  { codigo: 'desktop-walkthrough', nombre: 'Desktop Walkthrough', descripcion: 'Simulación en miniatura de un servicio o experiencia usando elementos sobre una mesa.' },
  { codigo: 'impresion-3d', nombre: 'Impresión 3D', descripcion: 'Fabricación aditiva de prototipos físicos a partir de modelos digitales.' },
  { codigo: 'infografia', nombre: 'Infografía', descripcion: 'Representación visual de información compleja de forma clara y atractiva.' },
  { codigo: 'maqueta-carton', nombre: 'Maqueta de Cartón', descripcion: 'Prototipo físico construido con cartón y materiales simples para explorar forma y escala.' },
  { codigo: 'mockup', nombre: 'Mockup', descripcion: 'Representación visual estática de alta fidelidad del diseño de interfaz o producto.' },
  { codigo: 'modelos-3d', nombre: 'Modelos 3D', descripcion: 'Representaciones tridimensionales digitales del producto para visualización y evaluación.' },
  { codigo: 'service-blueprint', nombre: 'Service Blueprint', descripcion: 'Diagrama detallado que mapea el proceso completo de un servicio incluyendo frontstage y backstage.' },
  { codigo: 'service-prototype', nombre: 'Service Prototype', descripcion: 'Simulación de un servicio completo para testear la experiencia del usuario de extremo a extremo.' },
  { codigo: 'solution-diagram', nombre: 'Solution Diagram', descripcion: 'Diagrama visual que representa la arquitectura y componentes de la solución propuesta.' },
  { codigo: 'storyboard', nombre: 'Storyboard', descripcion: 'Secuencia de dibujos o pantallas que cuenta la historia visual de cómo el usuario interactúa con el producto.' },
  { codigo: 'storytelling', nombre: 'Storytelling', descripcion: 'Técnica narrativa para comunicar la propuesta de valor y la experiencia del usuario de forma memorable.' },
  { codigo: 'wireframe', nombre: 'Wireframe', descripcion: 'Esquema estructural de baja fidelidad que define la disposición de elementos en una interfaz.' },

  // Deliver > Preparación
  { codigo: 'matriz-feedback', nombre: 'Matriz de Feedback', descripcion: 'Herramienta estructurada para organizar y priorizar el feedback recibido durante las pruebas.' },
  { codigo: 'matriz-hipotesis', nombre: 'Matriz de Hipótesis', descripcion: 'Framework para definir, priorizar y validar las hipótesis clave del proyecto.' },
  { codigo: 'roadmap-prototipado', nombre: 'Roadmap de Prototipado', descripcion: 'Plan visual que define las iteraciones de prototipado, sus objetivos y cronología.' },

  // Deliver > Técnicas
  { codigo: 'test-cuantitativo', nombre: 'Test Cuantitativo', descripcion: 'Evaluación con métricas numéricas para medir el rendimiento y efectividad de la solución.' },
  { codigo: 'test-usuario', nombre: 'Test de Usuario', descripcion: 'Técnica de validación donde usuarios reales interactúan con el diseño mientras el equipo observa y analiza.' },
];

// Mapeo de herramientas a categorías (incluye herramientas compartidas en múltiples categorías)
const TOOL_CATEGORY_ASSIGNMENTS: { toolCodigo: string; categoryCodigo: string }[] = [
  // Discover > Empresa
  { toolCodigo: '5-porques', categoryCodigo: 'discover-empresa' },
  { toolCodigo: 'analogos-antilogos', categoryCodigo: 'discover-empresa' },
  { toolCodigo: 'business-model-canvas', categoryCodigo: 'discover-empresa' },
  { toolCodigo: 'diagnostico-industria', categoryCodigo: 'discover-empresa' },
  { toolCodigo: 'diagrama-sistema', categoryCodigo: 'discover-empresa' },
  { toolCodigo: 'foda', categoryCodigo: 'discover-empresa' },
  { toolCodigo: 'in-out', categoryCodigo: 'discover-empresa' },

  // Discover > Cliente/Mercado
  { toolCodigo: 'customer-journey-map', categoryCodigo: 'discover-cliente-mercado' },
  { toolCodigo: 'mapa-empatia', categoryCodigo: 'discover-cliente-mercado' },
  { toolCodigo: 'persona', categoryCodigo: 'discover-cliente-mercado' },
  { toolCodigo: 'role-play', categoryCodigo: 'discover-cliente-mercado' },
  { toolCodigo: 'stakeholder-map', categoryCodigo: 'discover-cliente-mercado' },

  // Define > Investigación
  { toolCodigo: 'benchmarking', categoryCodigo: 'define-investigacion' },
  { toolCodigo: 'busqueda-medios', categoryCodigo: 'define-investigacion' },
  { toolCodigo: 'buzz-report', categoryCodigo: 'define-investigacion' },
  { toolCodigo: 'cliente-misterioso', categoryCodigo: 'define-investigacion' },
  { toolCodigo: 'entrevista-cualitativa', categoryCodigo: 'define-investigacion' },
  { toolCodigo: 'entrevista-experto', categoryCodigo: 'define-investigacion' },
  { toolCodigo: 'foto-video-etnografia', categoryCodigo: 'define-investigacion' },
  { toolCodigo: 'focus-group', categoryCodigo: 'define-investigacion' },
  { toolCodigo: 'investigacion-remota', categoryCodigo: 'define-investigacion' },
  { toolCodigo: 'perspectiva-360', categoryCodigo: 'define-investigacion' },
  { toolCodigo: 'safari', categoryCodigo: 'define-investigacion' },
  { toolCodigo: 'shadowing', categoryCodigo: 'define-investigacion' },
  { toolCodigo: 'visita-campo', categoryCodigo: 'define-investigacion' },

  // Define > Síntesis
  { toolCodigo: 'brief', categoryCodigo: 'define-sintesis' },
  { toolCodigo: 'desafio-diseno', categoryCodigo: 'define-sintesis' },
  { toolCodigo: 'from-to', categoryCodigo: 'define-sintesis' },
  { toolCodigo: 'insights-cluster', categoryCodigo: 'define-sintesis' },
  { toolCodigo: 'key-facts', categoryCodigo: 'define-sintesis' },
  { toolCodigo: 'mapa-activo-experiencia', categoryCodigo: 'define-sintesis' },
  { toolCodigo: 'mapa-empatia', categoryCodigo: 'define-sintesis' },
  { toolCodigo: 'mapa-evolucion-innovacion', categoryCodigo: 'define-sintesis' },
  { toolCodigo: 'matriz-2x2', categoryCodigo: 'define-sintesis' },
  { toolCodigo: 'matriz-tendencias', categoryCodigo: 'define-sintesis' },
  { toolCodigo: 'metafora-problema', categoryCodigo: 'define-sintesis' },
  { toolCodigo: 'persona', categoryCodigo: 'define-sintesis' },
  { toolCodigo: 'poems', categoryCodigo: 'define-sintesis' },
  { toolCodigo: 'pov', categoryCodigo: 'define-sintesis' },
  { toolCodigo: 'stakeholder-map', categoryCodigo: 'define-sintesis' },

  // Develop > Idear
  { toolCodigo: 'brainstorming', categoryCodigo: 'develop-idear' },
  { toolCodigo: 'disenio-escenarios', categoryCodigo: 'develop-idear' },
  { toolCodigo: 'hibridacion-agregacion', categoryCodigo: 'develop-idear' },
  { toolCodigo: 'hibridacion-sintesis', categoryCodigo: 'develop-idear' },
  { toolCodigo: 'hibridacion-traslacion', categoryCodigo: 'develop-idear' },
  { toolCodigo: 'mapa-activo-experiencia', categoryCodigo: 'develop-idear' },
  { toolCodigo: 'mapa-convergencia', categoryCodigo: 'develop-idear' },
  { toolCodigo: 'seleccion-ideas', categoryCodigo: 'develop-idear' },
  { toolCodigo: 'sesion-cocreacion', categoryCodigo: 'develop-idear' },
  { toolCodigo: 'what-if', categoryCodigo: 'develop-idear' },

  // Develop > Prototipar
  { toolCodigo: 'mvp', categoryCodigo: 'develop-prototipar' },
  { toolCodigo: 'prototipo-empatizar', categoryCodigo: 'develop-prototipar' },
  { toolCodigo: 'prototipo-fisico', categoryCodigo: 'develop-prototipar' },
  { toolCodigo: 'prototipo-funcional', categoryCodigo: 'develop-prototipar' },
  { toolCodigo: 'prototipo-mostrar', categoryCodigo: 'develop-prototipar' },
  { toolCodigo: 'prototipo-pensar', categoryCodigo: 'develop-prototipar' },
  { toolCodigo: 'prototipo-rapido', categoryCodigo: 'develop-prototipar' },

  // Develop > Herramientas
  { toolCodigo: 'business-model-canvas', categoryCodigo: 'develop-herramientas' },
  { toolCodigo: 'concept-sketch', categoryCodigo: 'develop-herramientas' },
  { toolCodigo: 'customer-journey-map', categoryCodigo: 'develop-herramientas' },
  { toolCodigo: 'desktop-walkthrough', categoryCodigo: 'develop-herramientas' },
  { toolCodigo: 'impresion-3d', categoryCodigo: 'develop-herramientas' },
  { toolCodigo: 'infografia', categoryCodigo: 'develop-herramientas' },
  { toolCodigo: 'maqueta-carton', categoryCodigo: 'develop-herramientas' },
  { toolCodigo: 'mockup', categoryCodigo: 'develop-herramientas' },
  { toolCodigo: 'modelos-3d', categoryCodigo: 'develop-herramientas' },
  { toolCodigo: 'role-play', categoryCodigo: 'develop-herramientas' },
  { toolCodigo: 'service-blueprint', categoryCodigo: 'develop-herramientas' },
  { toolCodigo: 'service-prototype', categoryCodigo: 'develop-herramientas' },
  { toolCodigo: 'solution-diagram', categoryCodigo: 'develop-herramientas' },
  { toolCodigo: 'storyboard', categoryCodigo: 'develop-herramientas' },
  { toolCodigo: 'storytelling', categoryCodigo: 'develop-herramientas' },
  { toolCodigo: 'wireframe', categoryCodigo: 'develop-herramientas' },

  // Deliver > Preparación
  { toolCodigo: 'matriz-feedback', categoryCodigo: 'deliver-preparacion' },
  { toolCodigo: 'matriz-hipotesis', categoryCodigo: 'deliver-preparacion' },
  { toolCodigo: 'roadmap-prototipado', categoryCodigo: 'deliver-preparacion' },

  // Deliver > Técnicas
  { toolCodigo: 'entrevista-cualitativa', categoryCodigo: 'deliver-tecnicas' },
  { toolCodigo: 'focus-group', categoryCodigo: 'deliver-tecnicas' },
  { toolCodigo: 'test-cuantitativo', categoryCodigo: 'deliver-tecnicas' },
  { toolCodigo: 'test-usuario', categoryCodigo: 'deliver-tecnicas' },
];

// ─── SEED FUNCTIONS ─────────────────────────────────────────────────────────

async function seedAuth() {
  // 1. Crear permisos
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { codigo: perm.codigo },
      update: { descripcion: perm.descripcion },
      create: { codigo: perm.codigo, descripcion: perm.descripcion },
    });
  }
  console.log(`✓ ${PERMISSIONS.length} permisos creados`);

  // 2. Crear roles y asignar permisos
  for (const rolData of ROLES) {
    const { permissions, ...roleInfo } = rolData;

    const role = await prisma.role.upsert({
      where: { codigo: roleInfo.codigo },
      update: { nombre: roleInfo.nombre, descripcion: roleInfo.descripcion },
      create: { ...roleInfo },
    });

    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });

    for (const permCodigo of permissions) {
      const permission = await prisma.permission.findUnique({
        where: { codigo: permCodigo },
      });
      if (permission) {
        await prisma.rolePermission.create({
          data: { roleId: role.id, permissionId: permission.id },
        });
      }
    }
  }
  console.log(`✓ ${ROLES.length} roles creados con permisos`);

  // 3. Crear usuarios de prueba
  const passwordHash = await bcrypt.hash('password123', 10);

  const users = [
    {
      email: 'admin@example.com',
      nombre: 'Administrador',
      password: passwordHash,
      isSuperAdmin: true,
      rolCodigo: 'ADMIN',
    },
    {
      email: 'editor@example.com',
      nombre: 'Editor',
      password: passwordHash,
      isSuperAdmin: false,
      rolCodigo: 'EDITOR',
    },
    {
      email: 'viewer@example.com',
      nombre: 'Visualizador',
      password: passwordHash,
      isSuperAdmin: false,
      rolCodigo: 'VIEWER',
    },
  ];

  for (const userData of users) {
    const { rolCodigo, ...userInfo } = userData;

    const user = await prisma.user.upsert({
      where: { email: userInfo.email },
      update: { nombre: userInfo.nombre },
      create: { ...userInfo },
    });

    const role = await prisma.role.findUnique({ where: { codigo: rolCodigo } });
    if (role) {
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId: role.id } },
        update: {},
        create: { userId: user.id, roleId: role.id },
      });
    }
  }
  console.log(`✓ ${users.length} usuarios de prueba creados`);
  console.log('');
  console.log('Usuarios disponibles:');
  console.log('  admin@example.com   | password123 | SuperAdmin');
  console.log('  editor@example.com  | password123 | Editor');
  console.log('  viewer@example.com  | password123 | Viewer');
}

async function seedCatalog() {
  console.log('');
  console.log('Seeding catálogo de diseño...');

  // 1. Upsert fases de diseño
  for (const phase of DESIGN_PHASES) {
    await prisma.designPhase.upsert({
      where: { codigo: phase.codigo },
      update: { nombre: phase.nombre, descripcion: phase.descripcion, orden: phase.orden },
      create: phase,
    });
  }
  console.log(`✓ ${DESIGN_PHASES.length} fases de diseño creadas`);

  // 2. Upsert categorías de herramientas
  for (const cat of TOOL_CATEGORIES) {
    const phase = await prisma.designPhase.findUnique({ where: { codigo: cat.phaseCodigo } });
    if (!phase) throw new Error(`Fase no encontrada: ${cat.phaseCodigo}`);

    await prisma.toolCategory.upsert({
      where: { codigo: cat.codigo },
      update: { nombre: cat.nombre, descripcion: cat.descripcion, phaseId: phase.id },
      create: { codigo: cat.codigo, nombre: cat.nombre, descripcion: cat.descripcion, phaseId: phase.id },
    });
  }
  console.log(`✓ ${TOOL_CATEGORIES.length} categorías creadas`);

  // 3. Upsert herramientas
  for (const tool of TOOLS) {
    await prisma.tool.upsert({
      where: { codigo: tool.codigo },
      update: { nombre: tool.nombre, descripcion: tool.descripcion, comoSeUsa: tool.comoSeUsa, cuandoUsarlo: tool.cuandoUsarlo, ejemplo: tool.ejemplo },
      create: tool,
    });
  }
  console.log(`✓ ${TOOLS.length} herramientas creadas`);

  // 4. Sincronizar asignaciones herramienta-categoría
  await prisma.toolCategoryTool.deleteMany({});

  for (const assign of TOOL_CATEGORY_ASSIGNMENTS) {
    const tool = await prisma.tool.findUnique({ where: { codigo: assign.toolCodigo } });
    const category = await prisma.toolCategory.findUnique({ where: { codigo: assign.categoryCodigo } });

    if (!tool) throw new Error(`Herramienta no encontrada: ${assign.toolCodigo}`);
    if (!category) throw new Error(`Categoría no encontrada: ${assign.categoryCodigo}`);

    await prisma.toolCategoryTool.create({
      data: { toolId: tool.id, categoryId: category.id },
    });
  }
  console.log(`✓ ${TOOL_CATEGORY_ASSIGNMENTS.length} asignaciones herramienta-categoría creadas`);
}

// ─── MAIN ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('Iniciando seed...');

  await seedAuth();
  await seedCatalog();

  console.log('');
  console.log('Seed completado exitosamente.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
