import { Component, computed, inject, input, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgDiagramNodeTemplate, NgDiagramPortComponent, SimpleNode } from 'ng-diagram';
import { ACTOR_TIPOS, ActorTipo, FronteraPos } from './diagrama-sistema.types';
import { DiagramaNodeEditService } from './diagrama-node-edit.service';

export interface SistemaNodoData {
  label: string;
  tipo: ActorTipo;
  frontera: FronteraPos;
  color: string;
  bg: string;
  border: string;
  icon: string;
}

@Component({
  selector: 'app-diagrama-sistema-node',
  standalone: true,
  imports: [NgDiagramPortComponent, FormsModule],
  template: `
    <div
      class="dsn-node"
      [class.dsn-node--fuera]="frontera() === 'fuera'"
      [style.background]="meta().bg"
      [style.border-color]="meta().border"
    >
      <ng-diagram-port id="left" type="both" side="left" />

      <div class="dsn-node__edit" data-no-drag="true" data-no-pan="true">
        <div class="dsn-node__edit-row">
          <i class="pi {{ meta().icon }}" [style.color]="meta().color"></i>
          <input
            type="text"
            class="dsn-node__input"
            placeholder="Nombre..."
            [ngModel]="nombre()"
            (ngModelChange)="onNombreChange($event)"
            data-no-drag="true"
            data-no-pan="true"
          />
          <button
            class="dsn-node__delete"
            (click)="onDelete()"
            title="Eliminar actor"
            data-no-drag="true"
            data-no-pan="true"
          >
            <i class="pi pi-trash"></i>
          </button>
        </div>
        <div class="dsn-node__edit-row">
          <select
            class="dsn-node__select"
            [ngModel]="tipo()"
            (ngModelChange)="onTipoChange($event)"
            data-no-drag="true"
            data-no-pan="true"
          >
            @for (t of actorTipos; track t.value) {
              <option [value]="t.value">{{ t.label }}</option>
            }
          </select>
          <select
            class="dsn-node__select dsn-node__select--sm"
            [ngModel]="frontera()"
            (ngModelChange)="onFronteraChange($event)"
            data-no-drag="true"
            data-no-pan="true"
          >
            <option value="dentro">Dentro</option>
            <option value="fuera">Fuera</option>
          </select>
        </div>
      </div>

      <ng-diagram-port id="right" type="both" side="right" />
    </div>
  `,
  styles: [`
    .dsn-node {
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

    .dsn-node--fuera {
      border-style: dashed;
      opacity: 0.85;
    }
    .dsn-node__edit {
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
      min-width: 0;
    }

    .dsn-node__edit-row {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .dsn-node__input {
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

    .dsn-node__input:focus {
      border-color: var(--p-primary-400);
    }

    .dsn-node__select {
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

    .dsn-node__select--sm {
      flex: 0.6;
    }

    .dsn-node__delete {
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

    .dsn-node__delete .pi { font-size: 0.6rem; }

    .dsn-node__delete:hover {
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
export class DiagramaSistemaNodoComponent implements NgDiagramNodeTemplate<SistemaNodoData>, OnInit {
  node = input.required<SimpleNode<SistemaNodoData>>();
  nodeData = computed(() => this.node().data);

  private readonly editService = inject(DiagramaNodeEditService);
  readonly actorTipos = ACTOR_TIPOS;

  // Local editable state
  nombre = signal('');
  tipo = signal<ActorTipo>('organizacion');
  frontera = signal<FronteraPos>('dentro');

  // Compute visual meta from current tipo
  meta = computed(() => {
    const t = this.tipo();
    const found = ACTOR_TIPOS.find(a => a.value === t) ?? ACTOR_TIPOS[0];
    return {
      color: found.color,
      bg: found.bg,
      border: found.border,
      icon: found.icon,
    };
  });

  ngOnInit(): void {
    const data = this.nodeData();
    this.nombre.set(data.label);
    this.tipo.set(data.tipo);
    this.frontera.set(data.frontera);
  }

  onNombreChange(value: string): void {
    this.nombre.set(value);
    this.editService.nodeUpdated.next({
      id: this.node().id,
      field: 'nombre',
      value,
    });
  }

  onTipoChange(value: string): void {
    const tipo = value as ActorTipo;
    this.tipo.set(tipo);
    this.editService.nodeUpdated.next({
      id: this.node().id,
      field: 'tipo',
      value: tipo,
    });
  }

  onFronteraChange(value: string): void {
    const frontera = value as FronteraPos;
    this.frontera.set(frontera);
    this.editService.nodeUpdated.next({
      id: this.node().id,
      field: 'frontera',
      value: frontera,
    });
  }

  onDelete(): void {
    this.editService.nodeDeleted.next(this.node().id);
  }
}
