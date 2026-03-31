import { Component, Injector, effect, inject, input } from '@angular/core';
import {
  Edge,
  NgDiagramComponent,
  NgDiagramNodeTemplateMap,
  SimpleNode,
  initializeModel,
  provideNgDiagram,
} from 'ng-diagram';
import { InOutData, INPUT_TIPOS, OUTPUT_TIPOS } from './in-out.types';
import { InOutNodeComponent, InOutNodeData } from './in-out-node.component';

@Component({
  selector: 'app-in-out-diagram',
  standalone: true,
  imports: [NgDiagramComponent],
  providers: [provideNgDiagram()],
  template: `
    <div class="diagram-wrap">
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

    .diagram-wrap {
      width: 100%;
      height: 420px;
      border: 1px solid var(--p-surface-200);
      border-radius: 10px;
      overflow: hidden;
      background: #fafbfc;
    }
  `],
})
export class InOutDiagramComponent {
  data = input<InOutData>({ proceso: '', inputs: [], outputs: [] });

  private readonly injector = inject(Injector);

  model = initializeModel(undefined, this.injector);

  readonly nodeTemplateMap: NgDiagramNodeTemplateMap = new NgDiagramNodeTemplateMap([
    ['inout-node', InOutNodeComponent],
  ]);

  constructor() {
    effect(() => {
      this.model.updateNodes(this.buildNodes(this.data()));
      this.model.updateEdges(this.buildEdges(this.data()));
    });
  }

  private buildNodes(data: InOutData): SimpleNode<InOutNodeData>[] {
    const nodes: SimpleNode<InOutNodeData>[] = [];
    const spacing = 110;
    const centerY =
      Math.max((data.inputs.length - 1) * spacing, (data.outputs.length - 1) * spacing) / 2;

    nodes.push({
      id: 'process',
      type: 'inout-node',
      position: { x: 290, y: centerY },
      autoSize: true,
      data: {
        label: data.proceso || 'Proceso',
        nodeType: 'process',
        color: '#64748b',
        bg: '#f8fafc',
        border: '#94a3b8',
        icon: 'pi-cog',
      },
    });

    const inputStartY =
      Math.max(0, ((data.outputs.length - data.inputs.length) * spacing) / 2);
    data.inputs.forEach((inp, i) => {
      const meta = INPUT_TIPOS.find(t => t.value === inp.tipo) ?? INPUT_TIPOS[0];
      nodes.push({
        id: `input-${inp.id}`,
        type: 'inout-node',
        position: { x: 20, y: inputStartY + i * spacing },
        autoSize: true,
        data: {
          label: inp.descripcion || meta.label,
          nodeType: 'input',
          color: meta.color,
          bg: meta.bg,
          border: meta.border,
          icon: meta.icon,
        },
      });
    });

    const outputStartY =
      Math.max(0, ((data.inputs.length - data.outputs.length) * spacing) / 2);
    data.outputs.forEach((out, i) => {
      const meta = OUTPUT_TIPOS.find(t => t.value === out.tipo) ?? OUTPUT_TIPOS[0];
      nodes.push({
        id: `output-${out.id}`,
        type: 'inout-node',
        position: { x: 570, y: outputStartY + i * spacing },
        autoSize: true,
        data: {
          label: out.descripcion || meta.label,
          nodeType: 'output',
          color: meta.color,
          bg: meta.bg,
          border: meta.border,
          icon: meta.icon,
        },
      });
    });

    return nodes;
  }

  private buildEdges(data: InOutData): Edge[] {
    const edges: Edge[] = [];

    data.inputs.forEach(inp => {
      edges.push({
        id: `e-in-${inp.id}`,
        source: `input-${inp.id}`,
        sourcePort: 'right',
        target: 'process',
        targetPort: 'left',
        data: {},
      });
    });

    data.outputs.forEach(out => {
      edges.push({
        id: `e-out-${out.id}`,
        source: 'process',
        sourcePort: 'right',
        target: `output-${out.id}`,
        targetPort: 'left',
        data: {},
      });
    });

    return edges;
  }
}
