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
  { codigo: 'analogos-antilogos', nombre: 'Análogos y Antilogos', descripcion: 'Herramienta para identificar referentes positivos (análogos) y negativos (antilogos) que inspiren o adviertan sobre el diseño.' },
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
  { codigo: 'diagrama-sistema', nombre: 'Diagrama de Sistema', descripcion: 'Representación visual de los componentes de un sistema y sus interrelaciones.' },
  {
    codigo: 'foda',
    nombre: 'FODA (SWOT)',
    descripcion: 'Análisis de Fortalezas, Oportunidades, Debilidades y Amenazas para evaluar la posición estratégica.',
    comoSeUsa: `Listá en cada cuadrante los factores que corresponden: fortalezas y debilidades son internas al proyecto, oportunidades y amenazas son externas. No necesitás llenarlo todo — con 2 cuadrantes ya podés generar el análisis IA. Agregá ítems concretos y específicos, evitá generalidades.`,
    cuandoUsarlo: `Cuando necesitás una foto clara de la situación estratégica antes de tomar decisiones. Ideal al inicio de un proyecto, al evaluar un pivote, o cuando el equipo siente que "algo no está funcionando" pero no sabe exactamente qué.`,
    ejemplo: `Un startup de delivery lo usa antes de lanzar: fortalezas (equipo tech propio, precio competitivo), oportunidades (crecimiento del e-commerce local), debilidades (sin marca conocida), amenazas (PedidosYa y Rappi dominando el mercado).`,
  },
  { codigo: 'in-out', nombre: 'Diagrama In/Out', descripcion: 'Herramienta para definir el alcance del proyecto identificando qué está dentro y fuera del scope.' },

  // Discover > Cliente/Mercado
  { codigo: 'customer-journey-map', nombre: 'Customer Journey Map', descripcion: 'Mapa visual del recorrido completo del cliente a través de todos los puntos de contacto con el producto o servicio.' },
  { codigo: 'mapa-empatia', nombre: 'Mapa de Empatía', descripcion: 'Herramienta para comprender profundamente al usuario: qué piensa, siente, ve, oye, dice y hace.' },
  {
    codigo: 'persona',
    nombre: 'User Persona',
    descripcion: 'Representación arquetípica de un usuario objetivo basada en datos reales de investigación.',
    comoSeUsa: `Completá cada sección basándote en datos reales: entrevistas, encuestas, analytics — no en suposiciones. Una persona bien construida tiene tensiones internas (lo que quiere vs. lo que teme) que la hacen creíble. Si no tenés investigación previa, usala como hipótesis inicial para validar.`,
    cuandoUsarlo: `Antes de diseñar cualquier solución, cuando el equipo tiene visiones distintas sobre quién es el usuario, o cuando las decisiones de diseño generan debates sin resolución. Una persona compartida da un criterio de decisión común: "¿esto sirve a María?"`,
    ejemplo: `María, 34 años, gerente de proyectos en una consultora. Objetivo: terminar su trabajo antes de las 18hs para buscar a sus hijos. Frustración: las herramientas de gestión son lentas y requieren mucha configuración. Comportamiento: usa el celular para todo, prefiere voz a texto cuando puede.`,
  },
  { codigo: 'role-play', nombre: 'Role Play', descripcion: 'Técnica de simulación donde los participantes actúan roles para entender experiencias y perspectivas del usuario.' },
  { codigo: 'stakeholder-map', nombre: 'Stakeholder Map', descripcion: 'Mapa visual que identifica y clasifica a todos los actores involucrados en el proyecto según su influencia e interés.' },

  // Define > Investigación
  { codigo: 'benchmarking', nombre: 'Benchmarking', descripcion: 'Proceso de analizar productos, servicios o procesos de competidores o empresas líderes para comparar y aprender.' },
  { codigo: 'busqueda-medios', nombre: 'Búsqueda de Medios', descripcion: 'Investigación sistemática en medios de comunicación para recopilar información relevante sobre el contexto del proyecto.' },
  { codigo: 'buzz-report', nombre: 'Buzz Report', descripcion: 'Informe de menciones y conversaciones en medios digitales y redes sociales sobre un tema o marca.' },
  { codigo: 'cliente-misterioso', nombre: 'Cliente Misterioso', descripcion: 'Técnica de investigación encubierta donde se evalúa la experiencia del cliente de forma anónima.' },
  { codigo: 'entrevista-cualitativa', nombre: 'Entrevista Cualitativa', descripcion: 'Conversación estructurada o semi-estructurada para obtener insights profundos sobre experiencias y necesidades del usuario.' },
  { codigo: 'entrevista-experto', nombre: 'Entrevista con Experto', descripcion: 'Entrevista con especialistas del dominio para obtener conocimiento técnico y perspectivas informadas.' },
  { codigo: 'focus-group', nombre: 'Focus Group', descripcion: 'Sesión grupal moderada para explorar percepciones, opiniones y actitudes de usuarios sobre un tema.' },
  { codigo: 'investigacion-remota', nombre: 'Investigación Remota', descripcion: 'Técnicas de investigación realizadas a distancia mediante herramientas digitales.' },
  { codigo: 'perspectiva-360', nombre: 'Perspectiva 360', descripcion: 'Visión completa del problema desde múltiples ángulos y perspectivas de diferentes stakeholders.' },
  { codigo: 'safari', nombre: 'Safari', descripcion: 'Exploración inmersiva del entorno del usuario para observar comportamientos y contextos de uso en su hábitat natural.' },
  { codigo: 'shadowing', nombre: 'Shadowing', descripcion: 'Técnica de observación donde se acompaña al usuario durante su rutina para entender su experiencia real.' },
  { codigo: 'visita-campo', nombre: 'Visita de Campo', descripcion: 'Visita al entorno real donde ocurre el problema para observar y comprender el contexto de primera mano.' },

  // Define > Síntesis
  { codigo: 'brief', nombre: 'Brief', descripcion: 'Documento que resume los objetivos, alcance, restricciones y criterios de éxito del proyecto de diseño.' },
  { codigo: 'desafio-diseno', nombre: 'Desafío de Diseño', descripcion: 'Formulación concisa del problema a resolver, expresado como una pregunta que inspira soluciones creativas.' },
  { codigo: 'from-to', nombre: 'From-To', descripcion: 'Herramienta que define el estado actual (From) y el estado deseado (To) para visualizar la transformación buscada.' },
  { codigo: 'insights-cluster', nombre: 'Insights Cluster', descripcion: 'Agrupación temática de hallazgos de investigación para identificar patrones y oportunidades.' },
  { codigo: 'key-facts', nombre: 'Key Facts', descripcion: 'Recopilación de los datos y hechos más relevantes descubiertos durante la investigación.' },
  { codigo: 'mapa-activo-experiencia', nombre: 'Mapa Activo de la Experiencia', descripcion: 'Representación visual de la experiencia del usuario destacando momentos clave, emociones y oportunidades de mejora.' },
  { codigo: 'mapa-evolucion-innovacion', nombre: 'Mapa de Evolución e Innovación', descripcion: 'Visualización de la evolución de un producto o servicio y las oportunidades de innovación futuras.' },
  { codigo: 'matriz-2x2', nombre: 'Matriz 2x2', descripcion: 'Herramienta de priorización que clasifica elementos en 4 cuadrantes según dos criterios definidos.' },
  { codigo: 'matriz-tendencias', nombre: 'Matriz de Tendencias', descripcion: 'Herramienta para identificar y analizar tendencias relevantes del mercado y su impacto en el proyecto.' },
  { codigo: 'metafora-problema', nombre: 'Metáfora del Problema', descripcion: 'Uso de analogías y metáforas para reencuadrar el problema y generar nuevas perspectivas.' },
  { codigo: 'poems', nombre: 'POEMS', descripcion: 'Framework de observación que analiza People, Objects, Environments, Messages y Services.' },
  { codigo: 'pov', nombre: 'POV (Point of View)', descripcion: 'Declaración que articula el punto de vista del diseñador sobre el usuario, su necesidad y el insight descubierto.' },

  // Develop > Idear
  { codigo: 'brainstorming', nombre: 'Brainstorming', descripcion: 'Técnica de generación de ideas en grupo donde se busca producir la mayor cantidad posible sin juzgarlas.' },
  { codigo: 'disenio-escenarios', nombre: 'Diseño de Escenarios', descripcion: 'Creación de narrativas que describen cómo los usuarios interactuarán con la solución en diferentes contextos.' },
  { codigo: 'hibridacion-agregacion', nombre: 'Hibridación por Agregación', descripcion: 'Técnica de combinación de ideas donde se agregan elementos de diferentes conceptos para crear uno nuevo.' },
  { codigo: 'hibridacion-sintesis', nombre: 'Hibridación por Síntesis', descripcion: 'Técnica de fusión de ideas donde se sintetizan los mejores elementos de múltiples conceptos en uno.' },
  { codigo: 'hibridacion-traslacion', nombre: 'Hibridación por Traslación', descripcion: 'Técnica donde se trasladan conceptos exitosos de un dominio a otro para generar soluciones innovadoras.' },
  { codigo: 'mapa-convergencia', nombre: 'Mapa de Convergencia', descripcion: 'Herramienta para filtrar y converger ideas hacia las soluciones más prometedoras.' },
  { codigo: 'seleccion-ideas', nombre: 'Selección de Ideas', descripcion: 'Proceso estructurado para evaluar y seleccionar las mejores ideas generadas durante la ideación.' },
  { codigo: 'sesion-cocreacion', nombre: 'Sesión de Cocreación', descripcion: 'Taller colaborativo donde diseñadores y usuarios trabajan juntos para generar soluciones.' },
  { codigo: 'what-if', nombre: 'What If', descripcion: 'Técnica de ideación que plantea preguntas hipotéticas para explorar posibilidades no convencionales.' },

  // Develop > Prototipar
  { codigo: 'mvp', nombre: 'MVP', descripcion: 'Mínimo Producto Viable: versión simplificada del producto con las funcionalidades esenciales para validar hipótesis.' },
  { codigo: 'prototipo-empatizar', nombre: 'Prototipo para Empatizar', descripcion: 'Prototipo diseñado para generar empatía y comprensión sobre la experiencia del usuario.' },
  { codigo: 'prototipo-fisico', nombre: 'Prototipo Físico', descripcion: 'Representación tangible y tridimensional de la solución para evaluar forma, ergonomía e interacción.' },
  { codigo: 'prototipo-funcional', nombre: 'Prototipo Funcional', descripcion: 'Prototipo que replica funcionalidades reales del producto para pruebas de usabilidad avanzadas.' },
  { codigo: 'prototipo-mostrar', nombre: 'Prototipo para Mostrar', descripcion: 'Prototipo de alta fidelidad diseñado para presentar y comunicar la solución a stakeholders.' },
  { codigo: 'prototipo-pensar', nombre: 'Prototipo para Pensar', descripcion: 'Prototipo rápido y simple diseñado para explorar y reflexionar sobre conceptos de solución.' },
  { codigo: 'prototipo-rapido', nombre: 'Prototipo Rápido', descripcion: 'Prototipo construido rápidamente con materiales simples para obtener feedback temprano.' },

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
