import { Component, DestroyRef, Injector, ViewEncapsulation, effect, inject, input, output } from '@angular/core';
import {
  Edge,
  NgDiagramBackgroundComponent,
  NgDiagramComponent,
  NgDiagramModelService,
  NgDiagramNodeTemplateMap,
  SimpleNode,
  initializeModel,
  provideNgDiagram,
} from 'ng-diagram';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InOutData, INPUT_TIPOS, OUTPUT_TIPOS } from './in-out.types';
import { InOutNodeComponent, InOutNodeData } from './in-out-node.component';
import { InOutNodeEditService, InOutNodeFieldUpdate } from './in-out-node-edit.service';

@Component({
  selector: 'app-in-out-diagram',
  standalone: true,
  imports: [NgDiagramComponent, NgDiagramBackgroundComponent],
  providers: [provideNgDiagram(), InOutNodeEditService],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="io-diagram-wrap">
      <div class="io-diagram-hint">
        <i class="pi pi-info-circle"></i>
        Arrastrá nodos para reordenar · Editá directamente en cada nodo
      </div>
      <ng-diagram
        [model]="model"
        [config]="diagramConfig"
        [nodeTemplateMap]="nodeTemplateMap"
      >
        <ng-diagram-background type="dots" />
      </ng-diagram>
      <div class="io-diagram-actions">
        <button class="io-diagram-add-btn io-diagram-add-btn--input" (click)="onAddInput()">
          <i class="pi pi-plus"></i> Input
        </button>
        <button class="io-diagram-add-btn io-diagram-add-btn--output" (click)="onAddOutput()">
          <i class="pi pi-plus"></i> Output
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .io-diagram-wrap {
      width: 100%;
      height: 460px;
      border: 1px solid var(--p-surface-200);
      border-radius: 10px;
      overflow: hidden;
      background: #fafbfc;
      position: relative;
    }

    .io-diagram-wrap > ng-diagram {
      width: 100%;
      height: 100%;
    }

    .io-diagram-hint {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 5px 10px;
      font-size: 0.7rem;
      color: var(--p-text-muted-color);
      background: rgba(249,250,251,0.9);
      border-bottom: 1px solid var(--p-surface-200);
      pointer-events: none;
    }

    .io-diagram-hint .pi { font-size: 0.7rem; opacity: 0.6; }

    .io-diagram-actions {
      position: absolute;
      bottom: 12px;
      right: 12px;
      z-index: 1;
      display: flex;
      gap: 6px;
    }

    .io-diagram-add-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 7px 14px;
      border-radius: 8px;
      border: 1px solid var(--p-surface-300);
      background: white;
      font-size: 0.78rem;
      font-weight: 600;
      font-family: inherit;
      color: var(--p-text-color);
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
      transition: all 0.15s;
    }

    .io-diagram-add-btn .pi { font-size: 0.75rem; }

    .io-diagram-add-btn--input:hover {
      background: #eff6ff;
      border-color: #93c5fd;
      color: #1d4ed8;
    }

    .io-diagram-add-btn--output:hover {
      background: #f0fdf4;
      border-color: #86efac;
      color: #047857;
    }
  `],
})
export class InOutDiagramComponent {
  data = input<InOutData>({ proceso: '', inputs: [], outputs: [] });

  nodeFieldUpdated = output<InOutNodeFieldUpdate>();
  nodeDeleteRequested = output<string>();
  inputAddRequested = output<void>();
  outputAddRequested = output<void>();

  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly nodeEditService = inject(InOutNodeEditService);
  private readonly modelService = inject(NgDiagramModelService);

  model = initializeModel(undefined, this.injector);

  readonly diagramConfig = {
    zoom: {
      max: 1.5,
      zoomToFit: {
        padding: 40,
        onInit: true,
      },
    },
  };

  readonly nodeTemplateMap: NgDiagramNodeTemplateMap = new NgDiagramNodeTemplateMap([
    ['inout-node', InOutNodeComponent],
  ]);

  private modelInitialized = false;

  constructor() {
    // Build model once on mount
    effect(() => {
      const data = this.data();
      if (this.modelInitialized) return;
      this.model.updateNodes(this.buildNodes(data));
      this.model.updateEdges(this.buildEdges(data));
      this.modelInitialized = true;
    });

    // Subscribe to node edits from custom nodes
    this.nodeEditService.nodeUpdated
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(update => this.nodeFieldUpdated.emit(update));

    this.nodeEditService.nodeDeleted
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(id => {
        this.modelService.deleteNodes([id]);
        this.nodeDeleteRequested.emit(id);
      });
  }

  onAddInput(): void {
    this.inputAddRequested.emit();
  }

  onAddOutput(): void {
    this.outputAddRequested.emit();
  }

  addInputNode(id: string, y: number): void {
    const meta = INPUT_TIPOS[0];
    const node: SimpleNode<InOutNodeData> = {
      id: `input-${id}`,
      type: 'inout-node',
      position: { x: 20, y },
      autoSize: true,
      data: {
        label: '',
        nodeType: 'input',
        tipo: meta.value,
        color: meta.color,
        bg: meta.bg,
        border: meta.border,
        icon: meta.icon,
      },
    };
    this.modelService.addNodes([node]);

    const edge: Edge = {
      id: `e-in-${id}`,
      source: `input-${id}`,
      sourcePort: 'right',
      target: 'process',
      targetPort: 'left',
      data: {},
    };
    this.modelService.addEdges([edge]);
  }

  addOutputNode(id: string, y: number): void {
    const meta = OUTPUT_TIPOS[0];
    const node: SimpleNode<InOutNodeData> = {
      id: `output-${id}`,
      type: 'inout-node',
      position: { x: 570, y },
      autoSize: true,
      data: {
        label: '',
        nodeType: 'output',
        tipo: meta.value,
        color: meta.color,
        bg: meta.bg,
        border: meta.border,
        icon: meta.icon,
      },
    };
    this.modelService.addNodes([node]);

    const edge: Edge = {
      id: `e-out-${id}`,
      source: 'process',
      sourcePort: 'right',
      target: `output-${id}`,
      targetPort: 'left',
      data: {},
    };
    this.modelService.addEdges([edge]);
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
        tipo: '',
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
          tipo: inp.tipo,
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
          tipo: out.tipo,
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
