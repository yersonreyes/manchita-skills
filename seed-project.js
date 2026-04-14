const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function seed() {
  // Obtener usuario admin
  const admin = await prisma.user.findUnique({ where: { email: "admin@example.com" } });
  
  // Crear proyecto de ejemplo
  const proyecto = await prisma.project.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      nombre: "App de Delivery Healthy",
      descripcion: "Proyecto de diseno para una aplicacion de delivery de comida saludable. Objetivo: validar el problema y disenar una solucion que mejore la experiencia de usuarios que buscan opciones saludables.",
      tipo: "PRODUCTO_DIGITAL",
      etapa: "VALIDACION",
      sector: "FoodTech",
      contexto: "El mercado de delivery esta saturado de opciones de comida rapida. Existe una oportunidad no cubierta para usuarios que buscan opciones saludables y personalizadas.",
      estado: "IN_PROGRESS",
      presupuesto: 15000000,
      moneda: "CLP",
      ownerId: admin.id,
    },
  });

  // Agregar miembros al proyecto
  const users = await prisma.user.findMany({ take: 3 });
  for (let i = 0; i < users.length; i++) {
    await prisma.projectMember.upsert({
      where: { projectId_userId: { projectId: proyecto.id, userId: users[i].id } },
      update: {},
      create: {
        projectId: proyecto.id,
        userId: users[i].id,
        role: i === 0 ? "OWNER" : "EDITOR",
        cargo: i === 0 ? "Product Owner" : i === 1 ? "UX Designer" : "Developer",
        horasSemanalesProyecto: 20,
      },
    });
  }

  // Crear fases del proyecto (las 4 del Double Diamond)
  const phases = await prisma.designPhase.findMany({ orderBy: { orden: "asc" } });
  for (let i = 0; i < phases.length; i++) {
    await prisma.projectPhase.upsert({
      where: { projectId_phaseId_orden: { projectId: proyecto.id, phaseId: phases[i].id, orden: i + 1 } },
      update: {},
      create: {
        projectId: proyecto.id,
        phaseId: phases[i].id,
        estado: i === 0 ? "COMPLETED" : i === 1 ? "IN_PROGRESS" : "NOT_STARTED",
        orden: i + 1,
      },
    });
  }

  // Obtener fases creadas
  const proyectoPhases = await prisma.projectPhase.findMany({
    where: { projectId: proyecto.id },
    include: { phase: true },
    orderBy: { orden: "asc" },
  });

  // Aplicar algunas herramientas en cada fase
  const tools = await prisma.tool.findMany({ take: 15 });
  let toolIndex = 0;
  for (const pPhase of proyectoPhases) {
    const toolsToApply = tools.slice(toolIndex, toolIndex + 4);
    for (let i = 0; i < toolsToApply.length; i++) {
      await prisma.toolApplication.create({
        data: {
          projectPhaseId: pPhase.id,
          toolId: toolsToApply[i].id,
          titulo: toolsToApply[i].nombre + " - " + pPhase.phase.nombre,
          estado: pPhase.phase.orden === 1 ? "COMPLETED" : pPhase.phase.orden === 2 ? "IN_PROGRESS" : "PENDING",
          createdById: admin.id,
        },
      });
    }
    toolIndex += 4;
  }

  // Crear estados de tareas
  const taskStatuses = [
    { nombre: "Backlog", color: "#6B7280", orden: 0, isFinal: false },
    { nombre: "Por Hacer", color: "#3B82F6", orden: 1, isFinal: false },
    { nombre: "En Progreso", color: "#F59E0B", orden: 2, isFinal: false },
    { nombre: "En Revision", color: "#8B5CF6", orden: 3, isFinal: false },
    { nombre: "Hecho", color: "#10B981", orden: 4, isFinal: true },
  ];
  for (const status of taskStatuses) {
    await prisma.taskStatus.create({
      data: { ...status, projectId: proyecto.id },
    });
  }

  // Crear algunas tareas
  const statuses = await prisma.taskStatus.findMany({ where: { projectId: proyecto.id } });
  const toolApps = await prisma.toolApplication.findMany({ where: { projectPhase: { projectId: proyecto.id } } });

  const tareas = [
    { titulo: "Investigar mercado de comida saludable", descripcion: "Analizar competidores y tendencias en el mercado de delivery saludable", prioridad: "HIGH", statusIndex: 4 },
    { titulo: "Entrevistas con usuarios potenciales", descripcion: "Realizar 10 entrevistas con usuarios que pedidon comida saludable", prioridad: "HIGH", statusIndex: 4 },
    { titulo: "Crear persona del usuario target", descripcion: "Definir las personas basandose en insights de investigacion", prioridad: "MEDIUM", statusIndex: 3 },
    { titulo: "Definir propuesta de valor", descripcion: "Formular la propuesta de valor unica del producto", prioridad: "HIGH", statusIndex: 2 },
    { titulo: "Disenar flujo de checkout", descripcion: "Crear wireframes del flujo de compra", prioridad: "MEDIUM", statusIndex: 1 },
    { titulo: "Prototipar pantalla principal", descripcion: "Crear prototipo de alta fidelidad de la home", prioridad: "MEDIUM", statusIndex: 0 },
    { titulo: "Test de usabilidad con prototype", descripcion: "Validar el prototipo con 5 usuarios", prioridad: "LOW", statusIndex: 0 },
    { titulo: "Documentar aprendizajes", descripcion: "Compilar insights y recomendaciones para siguiente fase", prioridad: "LOW", statusIndex: 0 },
  ];

  for (let i = 0; i < tareas.length; i++) {
    await prisma.task.create({
      data: {
        projectId: proyecto.id,
        titulo: tareas[i].titulo,
        descripcion: tareas[i].descripcion,
        prioridad: tareas[i].prioridad,
        statusId: statuses[tareas[i].statusIndex].id,
        createdById: admin.id,
        assigneeId: i < users.length ? users[i].id : null,
        orden: i,
        fechaVencimiento: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // Crear wiki pages
  const wikiPages = [
    { titulo: "Inicio", contenido: "# Proyecto App Healthy Delivery\n\nBienvenido a la wiki del proyecto. Aqui encontras toda la documentacion generada.", orden: 0 },
    { titulo: "Investigacion", contenido: "# Fase de Investigacion\n\n## Entrevistas realizadas\n- 10 entrevistas con usuarios\n- 3 entrevistas con expertos\n\n## Hallazgos clave\n1. Los usuarios buscan opciones saludables pero no las encuentran\n2. La mayoria prefiere filtrar por ingredientes\n3. Quieren ver informacion nutricional clara", orden: 1 },
    { titulo: "Definicion", contenido: "# Fase de Definicion\n\n## Problema principal\nLos usuarios no encuentran opciones saludables easily en las apps de delivery existentes.\n\n## Opportunity\nCrear una experiencia especializada en comida saludable con filtros avanzados.", orden: 2 },
    { titulo: "Equipo", contenido: "# Equipo del Proyecto\n\n| Nombre | Rol | Contacto |\n|--------|-----|----------|\n| Admin | Product Owner | admin@example.com |\n| Editor | UX Designer | editor@example.com |", orden: 3 },
  ];

  for (const page of wikiPages) {
    await prisma.wikiPage.create({
      data: {
        projectId: proyecto.id,
        titulo: page.titulo,
        contenido: page.contenido,
        orden: page.orden,
        createdById: admin.id,
      },
    });
  }

  // Crear requisitos
  const requisitos = [
    { title: "Filtro por tipo de dieta", description: "El usuario debe poder filtrar restaurantes por tipo de dieta (vegana, keto, sin gluten, etc.)", type: "FUNCTIONAL", priority: "MUST_HAVE", status: "VALIDATED" },
    { title: "Informacion nutricional visible", description: "Cada plato debe mostrar caloricas, proteinas, carbohidratos y grasas", type: "FUNCTIONAL", priority: "MUST_HAVE", status: "DRAFT" },
    { title: "Tiempo de entrega estimado", description: "Mostrar tiempo estimado de entrega para cada restaurante", type: "FUNCTIONAL", priority: "SHOULD_HAVE", status: "DRAFT" },
    { title: "Rendimiento de la app", description: "La app debe cargar en menos de 3 segundos en conexiones 3G", type: "NON_FUNCTIONAL", subtype: "PERFORMANCE", priority: "MUST_HAVE", status: "DRAFT" },
    { title: "Accesibilidad WCAG", description: "Cumplir con WCAG 2.1 nivel AA", type: "NON_FUNCTIONAL", subtype: "USABILITY", priority: "SHOULD_HAVE", status: "DRAFT" },
  ];

  for (const req of requisitos) {
    await prisma.requirement.create({
      data: {
        projectId: proyecto.id,
        title: req.title,
        description: req.description,
        type: req.type,
        subtype: req.subtype,
        priority: req.priority,
        status: req.status,
        createdById: admin.id,
        acceptanceCriteria: ["Criterio 1", "Criterio 2"],
      },
    });
  }

  // Crear presupuesto/recursos
  const recursos = [
    { nombre: "Desarrollador Frontend", tipo: "PERSONA", costo: 2500000, frecuencia: "MENSUAL", duracionMeses: 6 },
    { nombre: "Desarrollador Backend", tipo: "PERSONA", costo: 2500000, frecuencia: "MENSUAL", duracionMeses: 6 },
    { nombre: "Disenador UX", tipo: "PERSONA", costo: 2000000, frecuencia: "MENSUAL", duracionMeses: 3 },
    { nombre: "Servidor AWS (mes)", tipo: "SERVIDOR", costo: 150000, frecuencia: "MENSUAL", duracionMeses: 12 },
    { nombre: "Figma Team", tipo: "LICENCIA", costo: 45000, frecuencia: "MENSUAL", duracionMeses: 6 },
  ];

  for (const rec of recursos) {
    await prisma.recursoProyecto.create({
      data: {
        projectId: proyecto.id,
        nombre: rec.nombre,
        tipo: rec.tipo,
        costo: rec.costo,
        frecuencia: rec.frecuencia,
        duracionMeses: rec.duracionMeses,
        esRecurrente: rec.frecuencia === "MENSUAL",
      },
    });
  }

  // Crear ingresos
  await prisma.ingresoProyecto.create({
    data: {
      projectId: proyecto.id,
      concepto: "Inversion semilla",
      monto: 15000000,
      moneda: "CLP",
      empresaPagadora: "Angel Investors Chile",
      contactoPagadora: "Juan Perez",
      emailPagadora: "juan@angels.cl",
      fechaVencimiento: new Date("2026-12-31"),
      estadoCobro: "COBRADO",
    },
  });

  console.log("=== Seed de proyecto de ejemplo completado ===");
  console.log("Proyecto:", proyecto.nombre);
  console.log("Miembros:", users.length);
  console.log("Fases:", proyectoPhases.length);
  console.log("Herramientas aplicadas:", toolApps.length);
  console.log("Tareas:", tareas.length);
  console.log("Wiki pages:", wikiPages.length);
  console.log("Requisitos:", requisitos.length);
  console.log("Recursos:", recursos.length);
}

seed()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
