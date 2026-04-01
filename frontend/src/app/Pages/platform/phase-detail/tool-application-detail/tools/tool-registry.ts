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
};

export const DEFAULT_TOOL: ToolMeta = {
  component: DefaultToolComponent,
  tabLabel: 'Herramienta',
  tabIcon: 'pi-wrench',
};

export function resolveToolMeta(codigo: string | undefined): ToolMeta {
  return (codigo && TOOL_REGISTRY[codigo]) ? TOOL_REGISTRY[codigo] : DEFAULT_TOOL;
}
