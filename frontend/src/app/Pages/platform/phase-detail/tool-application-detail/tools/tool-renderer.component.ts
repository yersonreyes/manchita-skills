import { NgComponentOutlet } from '@angular/common';
import { Component, Type, computed, input } from '@angular/core';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { DefaultToolComponent } from './default/default-tool.component';
import { FodaToolComponent } from './foda/foda-tool.component';
import { PersonaToolComponent } from './persona/persona-tool.component';

// ─── Registry ────────────────────────────────────────────────────────────────
// Mapeá el `codigo` de la tool a su componente específico.
// Si no hay match, se usa DefaultToolComponent como fallback.
const TOOL_REGISTRY: Record<string, Type<unknown>> = {
  'persona': PersonaToolComponent,
  'foda': FodaToolComponent,
  // Agregá más herramientas acá a medida que se implementen:
  // 'mapa-empatia': MapaEmpatiaToolComponent,
  // 'customer-journey-map': CustomerJourneyMapToolComponent,
  // 'business-model-canvas': BusinessModelCanvasToolComponent,
};

@Component({
  selector: 'app-tool-renderer',
  standalone: true,
  imports: [NgComponentOutlet],
  template: `
    <ng-container
      [ngComponentOutlet]="component()"
      [ngComponentOutletInputs]="{ application: application() }"
    />
  `,
})
export class ToolRendererComponent {
  application = input<ToolApplicationResDto | null>(null);

  component = computed<Type<unknown>>(() => {
    const codigo = this.application()?.tool?.codigo;
    return (codigo && TOOL_REGISTRY[codigo]) ? TOOL_REGISTRY[codigo] : DefaultToolComponent;
  });
}
