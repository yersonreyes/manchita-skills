export interface BmcFieldConfig {
  key: string;
  label: string;
  placeholder: string;
}

export interface BmcBlockConfig {
  key: string;
  label: string;
  labelShort: string;
  icon: string;
  fields: BmcFieldConfig[];
  required: boolean;
}

export const BMC_BLOCKS: BmcBlockConfig[] = [
  {
    key: 'asociacionesClaves',
    label: 'Asociaciones Clave',
    labelShort: 'Asociaciones',
    icon: 'pi-handshake',
    required: false,
    fields: [
      { key: 'sociosPrincipales', label: '¿Quiénes son tus socios clave?', placeholder: 'Ej: proveedores estratégicos, distribuidores, aliados tecnológicos...' },
      { key: 'queTercerizan', label: '¿Qué tercerizás?', placeholder: 'Ej: logística, infraestructura cloud, procesamiento de pagos...' },
      { key: 'motivacion', label: '¿Qué los motiva a asociarse?', placeholder: 'Ej: reducción de riesgo, acceso a recursos, economía de escala...' },
    ],
  },
  {
    key: 'actividadesClaves',
    label: 'Actividades Clave',
    labelShort: 'Actividades',
    icon: 'pi-cog',
    required: false,
    fields: [
      { key: 'actividadesPrincipales', label: '¿Qué actividades son esenciales?', placeholder: 'Ej: desarrollo de software, atención al cliente, marketing...' },
      { key: 'produccionVsServicio', label: '¿Producción, servicio o plataforma?', placeholder: 'Ej: plataforma digital que conecta oferta y demanda...' },
      { key: 'diferenciadoras', label: '¿Cuál te diferencia de la competencia?', placeholder: 'Ej: algoritmo de personalización, tiempo de respuesta de soporte...' },
    ],
  },
  {
    key: 'propuestaDeValor',
    label: 'Propuesta de Valor',
    labelShort: 'Propuesta',
    icon: 'pi-star',
    required: true,
    fields: [
      { key: 'problemasQueResuelve', label: '¿Qué problema resolvés?', placeholder: 'Ej: las pymes pierden tiempo gestionando inventario manualmente...' },
      { key: 'beneficiosClave', label: '¿Qué ganancia generás?', placeholder: 'Ej: reducen un 40% el tiempo en gestión y evitan roturas de stock...' },
      { key: 'productoServicio', label: '¿Qué ofrecés concretamente?', placeholder: 'Ej: plataforma SaaS de gestión de inventario con alertas automáticas...' },
    ],
  },
  {
    key: 'relacionesConClientes',
    label: 'Relaciones con Clientes',
    labelShort: 'Relaciones',
    icon: 'pi-heart',
    required: false,
    fields: [
      { key: 'tipoDeRelacion', label: '¿Qué tipo de relación tenés?', placeholder: 'Ej: self-service con soporte por chat, comunidad de usuarios...' },
      { key: 'adquisicion', label: '¿Cómo adquirís clientes?', placeholder: 'Ej: marketing digital, referidos, prueba gratuita de 14 días...' },
      { key: 'retencion', label: '¿Cómo los retenés?', placeholder: 'Ej: onboarding guiado, emails de activación, customer success...' },
    ],
  },
  {
    key: 'segmentosDeClientes',
    label: 'Segmentos de Clientes',
    labelShort: 'Segmentos',
    icon: 'pi-users',
    required: true,
    fields: [
      { key: 'clientePrincipal', label: '¿Quién es tu cliente principal?', placeholder: 'Ej: pymes del sector retail con 5-50 empleados en Argentina...' },
      { key: 'caracteristicas', label: '¿Qué los define?', placeholder: 'Ej: crecimiento acelerado, sin área de TI, ticket promedio $500...' },
      { key: 'necesidadQueResuelves', label: '¿Qué necesidad tienen?', placeholder: 'Ej: necesitan visibilidad en tiempo real de su inventario sin complejidad técnica...' },
    ],
  },
  {
    key: 'recursosClaves',
    label: 'Recursos Clave',
    labelShort: 'Recursos',
    icon: 'pi-box',
    required: false,
    fields: [
      { key: 'recursosNecesarios', label: '¿Qué recursos necesitás?', placeholder: 'Ej: plataforma cloud, equipo de desarrollo, base de datos de clientes...' },
      { key: 'tipoDeRecurso', label: '¿Son físicos, humanos, intelectuales?', placeholder: 'Ej: tecnológicos e intelectuales principalmente...' },
      { key: 'masCritico', label: '¿Cuál es el más crítico?', placeholder: 'Ej: el algoritmo de predicción de demanda es nuestro principal diferenciador...' },
    ],
  },
  {
    key: 'canales',
    label: 'Canales',
    labelShort: 'Canales',
    icon: 'pi-send',
    required: false,
    fields: [
      { key: 'comoLlegasAlCliente', label: '¿Cómo llegás a tus clientes?', placeholder: 'Ej: venta directa online, marketplace, fuerza de ventas...' },
      { key: 'etapaDelFunnel', label: '¿En qué etapa del funnel opera?', placeholder: 'Ej: adquisición via SEO, conversión via trial, retención via email...' },
      { key: 'costoEficiencia', label: '¿Es eficiente en costos?', placeholder: 'Ej: sí, bajo costo de adquisición digital vs. venta directa...' },
    ],
  },
  {
    key: 'fuentesDeIngreso',
    label: 'Fuentes de Ingreso',
    labelShort: 'Ingresos',
    icon: 'pi-dollar',
    required: true,
    fields: [
      { key: 'comoGenerasIngresos', label: '¿Cómo generás ingresos?', placeholder: 'Ej: suscripción mensual, comisión por transacción, licencias...' },
      { key: 'modeloDePrecio', label: '¿Cuál es tu modelo de precio?', placeholder: 'Ej: freemium con planes pagos de $20 a $100 USD/mes...' },
      { key: 'disposicionAPagar', label: '¿Cuánto pagaría tu cliente?', placeholder: 'Ej: dispuestos a pagar hasta $80 USD si resuelve el problema core...' },
    ],
  },
  {
    key: 'estructuraDeCostos',
    label: 'Estructura de Costos',
    labelShort: 'Costos',
    icon: 'pi-chart-bar',
    required: true,
    fields: [
      { key: 'costosPrincipales', label: '¿Cuáles son tus costos más grandes?', placeholder: 'Ej: salarios del equipo, infraestructura cloud, marketing...' },
      { key: 'costosFijosVsVariables', label: '¿Fijos o variables?', placeholder: 'Ej: 70% fijos (salarios), 30% variables (cloud, marketing performance)...' },
      { key: 'economiaDeEscala', label: '¿Hay economía de escala?', placeholder: 'Ej: sí, a partir de 1000 clientes el costo por cliente baja un 30%...' },
    ],
  },
];

export const BMC_BLOCKS_MAP = Object.fromEntries(BMC_BLOCKS.map((b) => [b.key, b]));

export const REQUIRED_BLOCK_KEYS = BMC_BLOCKS.filter((b) => b.required).map((b) => b.key);

export type BmcBlockKey = (typeof BMC_BLOCKS)[number]['key'];
