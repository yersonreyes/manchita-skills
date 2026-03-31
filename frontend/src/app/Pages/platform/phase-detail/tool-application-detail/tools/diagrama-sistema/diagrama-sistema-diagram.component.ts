import { Component, Injector, effect, inject, input } from '@angular/core';
import {
  Edge,
  NgDiagramComponent,
  NgDiagramNodeTemplateMap,
  SimpleNode,
  initializeModel,
  provideNgDiagram,
} from 'ng-diagram';
import { ACTOR_TIPOS, CONEXION_TIPOS, SistemaData } from './diagrama-sistema.types';
import { DiagramaSistemaNodoComponent, SistemaNodoData } from './diagrama-sistema-node.component';

@Component({
  selector: 'app-diagrama-sistema-diagram',
  standalone: true,
  imports: [NgDiagramComponent],
  providers: [provideNgDiagram()],
  template: `
    <div class="ds-diagram-wrap">
      <ng-diagram
        style="display:block;width:100%;height:100%;"
        [model]="model"
        [nodeTemplateMap]="nodeTemplateMap"
      />
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .ds-diagram-wrap {
      width: 100%;
      height: 460px;
      border: 1px solid var(--p-surface-200);
      border-radius: 10px;
      overflow: hidden;
      background: #fafbfc;
    }
  `],
})
export class DiagramaSistemaDiagramComponent {
  data = input<SistemaData>({ alcance: '', actores: [], conexiones: [] });

  private readonly injector = inject(Injector);

  model = initializeModel(undefined, this.injector);

  readonly nodeTemplateMap: NgDiagramNodeTemplateMap = new NgDiagramNodeTemplateMap([
    ['sistema-node', DiagramaSistemaNodoComponent],
  ]);

  constructor() {
    effect(() => {
      this.model.updateNodes(this.buildNodes(this.data()));
      this.model.updateEdges(this.buildEdges(this.data()));
    });
  }

  private buildNodes(data: SistemaData): SimpleNode<SistemaNodoData>[] {
    const nodes: SimpleNode<SistemaNodoData>[] = [];
    const cx = 300;
    const cy = 220;
    const radius = Math.max(160, data.actores.length * 38);

    data.actores.forEach((actor, i) => {
      const angle = (2 * Math.PI * i) / Math.max(data.actores.length, 1) - Math.PI / 2;
      const meta = ACTOR_TIPOS.find(t => t.value === actor.tipo) ?? ACTOR_TIPOS[0];
      nodes.push({
        id: actor.id,
        type: 'sistema-node',
        position: {
          x: cx + radius * Math.cos(angle),
          y: cy + radius * Math.sin(angle),
        },
        autoSize: true,
        data: {
          label: actor.nombre || meta.label,
          tipo: actor.tipo,
          frontera: actor.frontera,
          color: meta.color,
          bg: meta.bg,
          border: meta.border,
          icon: meta.icon,
        },
      });
    });

    return nodes;
  }

  private buildEdges(data: SistemaData): Edge[] {
    return data.conexiones
      .filter(
        c =>
          data.actores.find(a => a.id === c.fromId) &&
          data.actores.find(a => a.id === c.toId),
      )
      .map(c => {
        const meta = CONEXION_TIPOS.find(t => t.value === c.tipo) ?? CONEXION_TIPOS[0];
        return {
          id: c.id,
          source: c.fromId,
          sourcePort: 'right',
          target: c.toId,
          targetPort: 'left',
          label: meta.label,
          data: { color: meta.color },
        };
      });
  }
}
