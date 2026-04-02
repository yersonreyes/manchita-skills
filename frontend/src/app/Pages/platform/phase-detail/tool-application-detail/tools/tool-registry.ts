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
};

export const DEFAULT_TOOL: ToolMeta = {
  component: DefaultToolComponent,
  tabLabel: 'Herramienta',
  tabIcon: 'pi-wrench',
};

export function resolveToolMeta(codigo: string | undefined): ToolMeta {
  return (codigo && TOOL_REGISTRY[codigo]) ? TOOL_REGISTRY[codigo] : DEFAULT_TOOL;
}
