const TIPO_LABELS: Record<string, string> = {
  STARTUP: 'Startup / Emprendimiento',
  PRODUCTO_DIGITAL: 'Producto digital',
  INVESTIGACION_UX: 'Investigación UX',
  PROYECTO_INTERNO: 'Proyecto interno',
  SERVICIO: 'Servicio',
  PROCESO: 'Rediseño de proceso',
  OTRO: 'Otro',
};

const ETAPA_LABELS: Record<string, string> = {
  IDEA: 'Idea (concepto sin validar)',
  EXPLORACION: 'Exploración (investigando el problema)',
  VALIDACION: 'Validación (probando la solución)',
  DESARROLLO: 'Desarrollo (construyendo)',
  LANZAMIENTO: 'Lanzamiento (saliendo al mercado)',
  CRECIMIENTO: 'Crecimiento (escalando)',
  MADUREZ: 'Madurez (operación estable)',
};

export interface ProjectBriefContext {
  nombre: string;
  tipo: string | null;
  etapa: string | null;
  sector: string | null;
  contexto: string | null;
}

export function buildProjectContextSection(project: ProjectBriefContext): string {
  const hasBrief = project.tipo || project.etapa || project.sector || project.contexto;
  if (!hasBrief) return '';

  const lines: string[] = [`- Nombre del proyecto: ${project.nombre}`];
  if (project.tipo) lines.push(`- Tipo: ${TIPO_LABELS[project.tipo] ?? project.tipo}`);
  if (project.etapa) lines.push(`- Etapa: ${ETAPA_LABELS[project.etapa] ?? project.etapa}`);
  if (project.sector) lines.push(`- Sector/Industria: ${project.sector}`);
  if (project.contexto) lines.push(`- Contexto: ${project.contexto}`);

  return `\n\nCONTEXTO DEL PROYECTO:\n${lines.join('\n')}`;
}
