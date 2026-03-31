import { Component, computed, inject, input, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgDiagramNodeTemplate, NgDiagramPortComponent, SimpleNode } from 'ng-diagram';
import { INPUT_TIPOS, OUTPUT_TIPOS, InputTipo, OutputTipo } from './in-out.types';
import { InOutNodeEditService } from './in-out-node-edit.service';

export interface InOutNodeData {
  label: string;
  nodeType: 'input' | 'process' | 'output';
  tipo: string;
  color: string;
  bg: string;
  border: string;
  icon: string;
}

@Component({
  selector: 'app-in-out-node',
  standalone: true,
  imports: [NgDiagramPortComponent, FormsModule],
  template: `
    <div
      class="ion-node"
      [class.ion-node--process]="nodeType() === 'process'"
      [style.background]="meta().bg"
      [style.border-color]="meta().border"
    >
      @if (nodeType() === 'process') {
        <!-- Process node -->
        <ng-diagram-port id="left" type="both" side="left" />
        <div class="ion-node__process-edit" data-no-drag="true" data-no-pan="true">
          <i class="pi pi-cog" style="color:#64748b"></i>
          <input
            type="text"
            class="ion-node__input ion-node__input--process"
            placeholder="Nombre del proceso..."
            [ngModel]="label()"
            (ngModelChange)="onLabelChange($event)"
            data-no-drag="true"
            data-no-pan="true"
          />
        </div>
        <ng-diagram-port id="right" type="both" side="right" />
      } @else {
        <!-- Input / Output node -->
        <ng-diagram-port id="left" type="both" side="left" />
        <div class="ion-node__edit" data-no-drag="true" data-no-pan="true">
          <div class="ion-node__edit-row">
            <i class="pi {{ meta().icon }}" [style.color]="meta().color"></i>
            <input
              type="text"
              class="ion-node__input"
              [placeholder]="nodeType() === 'input' ? 'Describí este input...' : 'Describí este output...'"
              [ngModel]="label()"
              (ngModelChange)="onLabelChange($event)"
              data-no-drag="true"
              data-no-pan="true"
            />
            <button
              class="ion-node__delete"
              (click)="onDelete()"
              title="Eliminar"
              data-no-drag="true"
              data-no-pan="true"
            >
              <i class="pi pi-trash"></i>
            </button>
          </div>
          <div class="ion-node__edit-row">
            <select
              class="ion-node__select"
              [ngModel]="tipo()"
              (ngModelChange)="onTipoChange($event)"
              data-no-drag="true"
              data-no-pan="true"
            >
              @for (t of tipoOptions(); track t.value) {
                <option [value]="t.value">{{ t.label }}</option>
              }
            </select>
          </div>
        </div>
        <ng-diagram-port id="right" type="both" side="right" />
      }
    </div>
  `,
  styles: [`
    .ion-node {
      border: 2px solid;
      border-radius: 10px;
      padding: 10px 14px;
      min-width: 200px;
      max-width: 260px;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      position: relative;
      cursor: grab;
    }

    .ion-node--process {
      border-style: dashed;
      min-width: 180px;
      max-width: 220px;
    }

    /* Edit layout */
    .ion-node__edit {
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
      min-width: 0;
    }

    .ion-node__edit-row {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .ion-node__process-edit {
      display: flex;
      align-items: center;
      gap: 7px;
      flex: 1;
      min-width: 0;
    }

    .ion-node__input {
      flex: 1;
      min-width: 0;
      border: 1px solid rgba(0,0,0,0.12);
      border-radius: 5px;
      padding: 3px 6px;
      font-size: 0.75rem;
      font-family: inherit;
      background: white;
      color: var(--p-text-color);
      outline: none;
    }

    .ion-node__input:focus {
      border-color: var(--p-primary-400);
    }

    .ion-node__input--process {
      font-weight: 600;
      font-size: 0.78rem;
    }

    .ion-node__select {
      flex: 1;
      min-width: 0;
      border: 1px solid rgba(0,0,0,0.12);
      border-radius: 5px;
      padding: 3px 5px;
      font-size: 0.7rem;
      font-family: inherit;
      background: white;
      color: var(--p-text-color);
      cursor: pointer;
    }

    .ion-node__delete {
      width: 22px;
      height: 22px;
      border-radius: 5px;
      border: 1px solid rgba(0,0,0,0.1);
      background: white;
      color: var(--p-text-muted-color);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
      transition: all 0.15s;
    }

    .ion-node__delete .pi { font-size: 0.6rem; }

    .ion-node__delete:hover {
      background: #fef2f2;
      border-color: #fecaca;
      color: #dc2626;
    }

    .pi {
      font-size: 0.85rem;
      flex-shrink: 0;
    }
  `],
})
export class InOutNodeComponent implements NgDiagramNodeTemplate<InOutNodeData>, OnInit {
  node = input.required<SimpleNode<InOutNodeData>>();
  nodeData = computed(() => this.node().data);

  private readonly editService = inject(InOutNodeEditService);

  // Local state
  label = signal('');
  tipo = signal('');
  nodeType = signal<'input' | 'process' | 'output'>('input');

  meta = computed(() => {
    const t = this.tipo();
    const nt = this.nodeType();
    const list = nt === 'input' ? INPUT_TIPOS : nt === 'output' ? OUTPUT_TIPOS : [];
    const found = list.find(m => m.value === t);
    if (found) return found;
    // Process or fallback
    return { color: '#64748b', bg: '#f8fafc', border: '#94a3b8', icon: 'pi-cog', value: '', label: '' };
  });

  tipoOptions = computed(() => {
    return this.nodeType() === 'input' ? INPUT_TIPOS : OUTPUT_TIPOS;
  });

  ngOnInit(): void {
    const data = this.nodeData();
    this.label.set(data.label);
    this.tipo.set(data.tipo);
    this.nodeType.set(data.nodeType);
  }

  onLabelChange(value: string): void {
    this.label.set(value);
    const field = this.nodeType() === 'process' ? 'proceso' as const : 'descripcion' as const;
    this.editService.nodeUpdated.next({ id: this.node().id, field, value });
  }

  onTipoChange(value: string): void {
    this.tipo.set(value);
    this.editService.nodeUpdated.next({ id: this.node().id, field: 'tipo', value });
  }

  onDelete(): void {
    this.editService.nodeDeleted.next(this.node().id);
  }
}
