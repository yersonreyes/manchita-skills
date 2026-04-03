import { Type } from '@angular/core';
import { CincoPorquesComponent } from './5-porques/cinco-porques.component';
import { DefaultToolComponent } from './default/default-tool.component';
import { FodaToolComponent } from './foda/foda-tool.component';
import { PersonaToolComponent } from './persona/persona-tool.component';
import { BmcComponent } from './business-model-canvas/bmc.component';
import { DiagnosticoIndustriaToolComponent } from './diagnostico-industria/diagnostico-industria-tool.component';
import { AnalogosAntilogosToolComponent } from './analogos-antilogos/analogos-antilogos-tool.component';
import { InOutToolComponent } from './in-out/in-out-tool.component';
import { DiagramaSistemaToolComponent } from './diagrama-sistema/diagrama-sistema-tool.component';
import { StakeholderMapToolComponent } from './stakeholder-map/stakeholder-map-tool.component';
import { RolePlayToolComponent } from './role-play/role-play-tool.component';
import { MapaEmpatiaToolComponent } from './mapa-empatia/mapa-empatia-tool.component';
import { CustomerJourneyMapToolComponent } from './customer-journey-map/customer-journey-map-tool.component';
import { BenchmarkingToolComponent } from './benchmarking/benchmarking-tool.component';
import { BusquedaMediosToolComponent } from './busqueda-medios/busqueda-medios-tool.component';
import { BuzzReportToolComponent } from './buzz-report/buzz-report-tool.component';
import { EntrevistaCualitativaToolComponent } from './entrevista-cualitativa/entrevista-cualitativa-tool.component';
import { EntrevistaExpertoToolComponent } from './entrevista-experto/entrevista-experto-tool.component';
import { FocusGroupToolComponent } from './focus-group/focus-group-tool.component';
import { FotoVideoEtnografiaToolComponent } from './foto-video-etnografia/foto-video-etnografia-tool.component';
import { InvestigacionRemotaToolComponent } from './investigacion-remota/investigacion-remota-tool.component';
import { ClienteMisteriosoToolComponent } from './cliente-misterioso/cliente-misterioso-tool.component';
import { Perspectiva360ToolComponent } from './perspectiva-360/perspectiva-360-tool.component';
import { SafariToolComponent } from './safari/safari-tool.component';
import { ShadowingToolComponent } from './shadowing/shadowing-tool.component';
import { VisitaCampoToolComponent } from './visita-campo/visita-campo-tool.component';
import { PoemsToolComponent } from './poems/poems-tool.component';
import { MatrizTendenciasToolComponent } from './matriz-tendencias/matriz-tendencias-tool.component';
import { FromToToolComponent } from './from-to/from-to-tool.component';
import { MapaEvolucionInnovacionToolComponent } from './mapa-evolucion-innovacion/mapa-evolucion-innovacion-tool.component';
import { KeyFactsToolComponent } from './key-facts/key-facts-tool.component';
import { InsightsClusterToolComponent } from './insights-cluster/insights-cluster-tool.component';
import { Matriz2x2ToolComponent } from './matriz-2x2/matriz-2x2-tool.component';
import { MapaActivoExperienciaToolComponent } from './mapa-activo-experiencia/mapa-activo-experiencia-tool.component';
import { PovToolComponent } from './pov/pov-tool.component';
import { DesafioDisenoToolComponent } from './desafio-diseno/desafio-diseno-tool.component';
import { BriefToolComponent } from './brief/brief-tool.component';
import { MetaforaProblemaToolComponent } from './metafora-problema/metafora-problema-tool.component';
import { MapaConvergenciaToolComponent } from './mapa-convergencia/mapa-convergencia-tool.component';
import { BrainstormingToolComponent } from './brainstorming/brainstorming-tool.component';
import { SeleccionIdeasToolComponent } from './seleccion-ideas/seleccion-ideas-tool.component';
import { WhatIfToolComponent } from './what-if/what-if-tool.component';
import { HibridacionAgregacionToolComponent } from './hibridacion-agregacion/hibridacion-agregacion-tool.component';
import { HibridacionTraslacionToolComponent } from './hibridacion-traslacion/hibridacion-traslacion-tool.component';
import { HibridacionSintesisToolComponent } from './hibridacion-sintesis/hibridacion-sintesis-tool.component';
import { DisenioEscenariosToolComponent } from './disenio-escenarios/disenio-escenarios-tool.component';
import { SesionCocreacionToolComponent } from './sesion-cocreacion/sesion-cocreacion-tool.component';
import { PrototipoEmpatizarToolComponent } from './prototipo-empatizar/prototipo-empatizar-tool.component';

export interface ToolMeta {
  component: Type<unknown>;
  tabLabel: string;
  tabIcon: string;
}

// ─── Registry ────────────────────────────────────────────────────────────────
// Mapeá el `codigo` de la tool a su componente y metadata del tab.
// Si no hay match, se usa el fallback DEFAULT_TOOL.
export const TOOL_REGISTRY: Record<string, ToolMeta> = {
  '5-porques': {
    component: CincoPorquesComponent,
    tabLabel: 'Los 5 Porqués',
    tabIcon: 'pi-question-circle',
  },
  'foda': {
    component: FodaToolComponent,
    tabLabel: 'FODA',
    tabIcon: 'pi-th-large',
  },
  'persona': {
    component: PersonaToolComponent,
    tabLabel: 'Persona',
    tabIcon: 'pi-user',
  },
  'business-model-canvas': {
    component: BmcComponent,
    tabLabel: 'Business Model Canvas',
    tabIcon: 'pi-th-large',
  },
  'diagnostico-industria': {
    component: DiagnosticoIndustriaToolComponent,
    tabLabel: 'Diagnóstico de Industria',
    tabIcon: 'pi-chart-bar',
  },
  'analogos-antilogos': {
    component: AnalogosAntilogosToolComponent,
    tabLabel: 'Análogos y Antilogos',
    tabIcon: 'pi-arrows-h',
  },
  'in-out': {
    component: InOutToolComponent,
    tabLabel: 'Diagrama In/Out',
    tabIcon: 'pi-sitemap',
  },
  'diagrama-sistema': {
    component: DiagramaSistemaToolComponent,
    tabLabel: 'Diagrama de Sistema',
    tabIcon: 'pi-share-alt',
  },
  'stakeholder-map': {
    component: StakeholderMapToolComponent,
    tabLabel: 'Stakeholder Map',
    tabIcon: 'pi-users',
  },
  'role-play': {
    component: RolePlayToolComponent,
    tabLabel: 'Role Play',
    tabIcon: 'pi-comments',
  },
  'mapa-empatia': {
    component: MapaEmpatiaToolComponent,
    tabLabel: 'Mapa de Empatía',
    tabIcon: 'pi-heart',
  },
  'customer-journey-map': {
    component: CustomerJourneyMapToolComponent,
    tabLabel: 'Customer Journey Map',
    tabIcon: 'pi-map',
  },
  'benchmarking': {
    component: BenchmarkingToolComponent,
    tabLabel: 'Benchmarking',
    tabIcon: 'pi-chart-bar',
  },
  'busqueda-medios': {
    component: BusquedaMediosToolComponent,
    tabLabel: 'Búsqueda de Medios',
    tabIcon: 'pi-search',
  },
  'buzz-report': {
    component: BuzzReportToolComponent,
    tabLabel: 'Buzz Report',
    tabIcon: 'pi-bell',
  },
  'entrevista-cualitativa': {
    component: EntrevistaCualitativaToolComponent,
    tabLabel: 'Entrevista Cualitativa',
    tabIcon: 'pi-microphone',
  },
  'entrevista-experto': {
    component: EntrevistaExpertoToolComponent,
    tabLabel: 'Entrevista con Experto',
    tabIcon: 'pi-graduation-cap',
  },
  'focus-group': {
    component: FocusGroupToolComponent,
    tabLabel: 'Focus Group',
    tabIcon: 'pi-users',
  },
  'foto-video-etnografia': {
    component: FotoVideoEtnografiaToolComponent,
    tabLabel: 'Foto-Vídeo Etnografía',
    tabIcon: 'pi-camera',
  },
  'investigacion-remota': {
    component: InvestigacionRemotaToolComponent,
    tabLabel: 'Investigación Remota',
    tabIcon: 'pi-wifi',
  },
  'cliente-misterioso': {
    component: ClienteMisteriosoToolComponent,
    tabLabel: 'Cliente Misterioso',
    tabIcon: 'pi-eye-slash',
  },
  'perspectiva-360': {
    component: Perspectiva360ToolComponent,
    tabLabel: 'Perspectiva 360',
    tabIcon: 'pi-eye',
  },
  'safari': {
    component: SafariToolComponent,
    tabLabel: 'Safari / Design Safari',
    tabIcon: 'pi-map-marker',
  },
  'shadowing': {
    component: ShadowingToolComponent,
    tabLabel: 'Shadowing',
    tabIcon: 'pi-eye',
  },
  'visita-campo': {
    component: VisitaCampoToolComponent,
    tabLabel: 'Visita de Campo',
    tabIcon: 'pi-map',
  },
  'poems': {
    component: PoemsToolComponent,
    tabLabel: 'POEMS',
    tabIcon: 'pi-th-large',
  },
  'matriz-tendencias': {
    component: MatrizTendenciasToolComponent,
    tabLabel: 'Matriz de Tendencias',
    tabIcon: 'pi-chart-bar',
  },
  'from-to': {
    component: FromToToolComponent,
    tabLabel: 'From-To',
    tabIcon: 'pi-arrow-right',
  },
  'mapa-evolucion-innovacion': {
    component: MapaEvolucionInnovacionToolComponent,
    tabLabel: 'Mapa de Evolución e Innovación',
    tabIcon: 'pi-history',
  },
  'key-facts': {
    component: KeyFactsToolComponent,
    tabLabel: 'Key Facts',
    tabIcon: 'pi-list-check',
  },
  'insights-cluster': {
    component: InsightsClusterToolComponent,
    tabLabel: 'Insights Cluster',
    tabIcon: 'pi-objects-column',
  },
  'matriz-2x2': {
    component: Matriz2x2ToolComponent,
    tabLabel: 'Matriz 2×2',
    tabIcon: 'pi-th-large',
  },
  'mapa-activo-experiencia': {
    component: MapaActivoExperienciaToolComponent,
    tabLabel: 'Mapa Activo de la Experiencia',
    tabIcon: 'pi-map',
  },
  'pov': {
    component: PovToolComponent,
    tabLabel: 'POV (Point of View)',
    tabIcon: 'pi-eye',
  },
  'desafio-diseno': {
    component: DesafioDisenoToolComponent,
    tabLabel: 'Desafío de Diseño',
    tabIcon: 'pi-bolt',
  },
  'brief': {
    component: BriefToolComponent,
    tabLabel: 'Brief de Proyecto',
    tabIcon: 'pi-file',
  },
  'metafora-problema': {
    component: MetaforaProblemaToolComponent,
    tabLabel: 'Metáfora del Problema',
    tabIcon: 'pi-comment',
  },
  'mapa-convergencia': {
    component: MapaConvergenciaToolComponent,
    tabLabel: 'Mapa de Convergencia',
    tabIcon: 'pi-filter',
  },
  'brainstorming': {
    component: BrainstormingToolComponent,
    tabLabel: 'Brainstorming',
    tabIcon: 'pi-lightbulb',
  },
  'seleccion-ideas': {
    component: SeleccionIdeasToolComponent,
    tabLabel: 'Selección de Ideas',
    tabIcon: 'pi-list-check',
  },
  'what-if': {
    component: WhatIfToolComponent,
    tabLabel: 'What If',
    tabIcon: 'pi-question-circle',
  },
  'hibridacion-agregacion': {
    component: HibridacionAgregacionToolComponent,
    tabLabel: 'Hibridación por Agregación',
    tabIcon: 'pi-link',
  },
  'hibridacion-traslacion': {
    component: HibridacionTraslacionToolComponent,
    tabLabel: 'Hibridación por Traslación',
    tabIcon: 'pi-arrow-right-arrow-left',
  },
  'hibridacion-sintesis': {
    component: HibridacionSintesisToolComponent,
    tabLabel: 'Hibridación por Síntesis',
    tabIcon: 'pi-objects-column',
  },
  'disenio-escenarios': {
    component: DisenioEscenariosToolComponent,
    tabLabel: 'Diseño de Escenarios',
    tabIcon: 'pi-map',
  },
  'sesion-cocreacion': {
    component: SesionCocreacionToolComponent,
    tabLabel: 'Sesión de Cocreación',
    tabIcon: 'pi-users',
  },
  'prototipo-empatizar': {
    component: PrototipoEmpatizarToolComponent,
    tabLabel: 'Prototipo para Empatizar',
    tabIcon: 'pi-heart',
  },
};

export const DEFAULT_TOOL: ToolMeta = {
  component: DefaultToolComponent,
  tabLabel: 'Herramienta',
  tabIcon: 'pi-wrench',
};

export function resolveToolMeta(codigo: string | undefined): ToolMeta {
  return (codigo && TOOL_REGISTRY[codigo]) ? TOOL_REGISTRY[codigo] : DEFAULT_TOOL;
}
