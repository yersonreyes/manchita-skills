import { Component, DestroyRef, Injector, ViewEncapsulation, effect, inject, input, output } from '@angular/core';
import {
  Edge,
  EdgeDrawnEvent,
  NgDiagramBackgroundComponent,
  NgDiagramComponent,
  NgDiagramModelService,
  NgDiagramNodeTemplateMap,
  SelectionMovedEvent,
  SelectionRemovedEvent,
  SimpleNode,
  initializeModel,
  provideNgDiagram,
} from 'ng-diagram';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ACTOR_TIPOS, CONEXION_TIPOS, SistemaData } from './diagrama-sistema.types';
import { DiagramaSistemaNodoComponent, SistemaNodoData } from './diagrama-sistema-node.component';
import { DiagramaNodeEditService, NodeFieldUpdate } from './diagrama-node-edit.service';

export interface DiagramaEdgeDrawnEvent {
  fromId: string;
  toId: string;
  edgeId: string;
}

export interface DiagramaNodeMovedEvent {
  id: string;
  x: number;
  y: number;
}

export interface DiagramaSelectionRemovedEvent {
  nodeIds: string[];
  edgeIds: string[];
}

@Component({
  selector: 'app-diagrama-sistema-diagram',
  standalone: true,
  imports: [NgDiagramComponent, NgDiagramBackgroundComponent],
  providers: [provideNgDiagram(), DiagramaNodeEditService],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="ds-diagram-wrap">
      <div class="ds-diagram-hint">
        <i class="pi pi-info-circle"></i>
        Arrastrá nodos · Conectá desde un puerto · <kbd>Doble click</kbd> para editar · <kbd>Delete</kbd> para eliminar
      </div>
      <ng-diagram
        [model]="model"
        [config]="diagramConfig"
        [nodeTemplateMap]="nodeTemplateMap"
        (edgeDrawn)="onEdgeDrawn($event)"
        (selectionMoved)="onSelectionMoved($event)"
        (selectionRemoved)="onSelectionRemoved($event)"
      >
        <ng-diagram-background type="dots" />
      </ng-diagram>
      <button
        class="ds-diagram-add-btn"
        (click)="onAddActorClick()"
        title="Agregar actor al diagrama"
      >
        <i class="pi pi-plus"></i> Actor
      </button>
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
      position: relative;
    }

    .ds-diagram-wrap > ng-diagram {
      width: 100%;
      height: 100%;
    }

    .ds-diagram-hint {
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

    .ds-diagram-hint .pi { font-size: 0.7rem; opacity: 0.6; }

    kbd {
      font-size: 0.65rem;
      background: var(--p-surface-200);
      border-radius: 3px;
      padding: 1px 4px;
      border: 1px solid var(--p-surface-300);
      font-family: monospace;
    }

    .ds-diagram-add-btn {
      position: absolute;
      bottom: 12px;
      right: 12px;
      z-index: 1;
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

    .ds-diagram-add-btn .pi { font-size: 0.75rem; }

    .ds-diagram-add-btn:hover {
      background: var(--p-primary-50, #eff6ff);
      border-color: var(--p-primary-300, #93c5fd);
      color: var(--p-primary-700, #1d4ed8);
    }
  `],
})
export class DiagramaSistemaDiagramComponent {
  data = input<SistemaData>({ alcance: '', actores: [], conexiones: [] });

  edgeDrawn = output<DiagramaEdgeDrawnEvent>();
  nodeMoved = output<DiagramaNodeMovedEvent[]>();
  selectionRemoved = output<DiagramaSelectionRemovedEvent>();
  nodeFieldUpdated = output<NodeFieldUpdate>();
  nodeDeleteRequested = output<string>();
  actorAddRequested = output<void>();

  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly nodeEditService = inject(DiagramaNodeEditService);
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
    ['sistema-node', DiagramaSistemaNodoComponent],
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

    // Subscribe to node edit events from custom nodes
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

  onAddActorClick(): void {
    this.actorAddRequested.emit();
  }

  addNodeToModel(nodeData: { id: string; label: string; tipo: string; frontera: string; x: number; y: number }): void {
    const meta = ACTOR_TIPOS.find(t => t.value === nodeData.tipo) ?? ACTOR_TIPOS[0];
    const node: SimpleNode<SistemaNodoData> = {
      id: nodeData.id,
      type: 'sistema-node',
      position: { x: nodeData.x, y: nodeData.y },
      autoSize: true,
      data: {
        label: nodeData.label || meta.label,
        tipo: nodeData.tipo as any,
        frontera: nodeData.frontera as any,
        color: meta.color,
        bg: meta.bg,
        border: meta.border,
        icon: meta.icon,
      },
    };
    this.modelService.addNodes([node]);
  }

  onEdgeDrawn(event: EdgeDrawnEvent): void {
    this.edgeDrawn.emit({
      fromId: event.source.id,
      toId: event.target.id,
      edgeId: event.edge.id,
    });
  }

  onSelectionMoved(event: SelectionMovedEvent): void {
    const moved: DiagramaNodeMovedEvent[] = event.nodes.map(n => ({
      id: n.id,
      x: n.position.x,
      y: n.position.y,
    }));
    this.nodeMoved.emit(moved);
  }

  onSelectionRemoved(event: SelectionRemovedEvent): void {
    this.selectionRemoved.emit({
      nodeIds: event.deletedNodes.map(n => n.id),
      edgeIds: event.deletedEdges.map(e => e.id),
    });
  }

  private buildNodes(data: SistemaData): SimpleNode<SistemaNodoData>[] {
    const nodes: SimpleNode<SistemaNodoData>[] = [];
    const cx = 300;
    const cy = 200;
    const radius = Math.max(160, data.actores.length * 38);

    data.actores.forEach((actor, i) => {
      const meta = ACTOR_TIPOS.find(t => t.value === actor.tipo) ?? ACTOR_TIPOS[0];
      const angle = (2 * Math.PI * i) / Math.max(data.actores.length, 1) - Math.PI / 2;
      const x = actor.x ?? cx + radius * Math.cos(angle);
      const y = actor.y ?? cy + radius * Math.sin(angle);

      nodes.push({
        id: actor.id,
        type: 'sistema-node',
        position: { x, y },
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
