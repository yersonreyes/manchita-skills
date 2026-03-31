import { Component, computed, input } from '@angular/core';
import { NgDiagramNodeTemplate, NgDiagramPortComponent, SimpleNode } from 'ng-diagram';
import { ActorTipo, FronteraPos } from './diagrama-sistema.types';

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
  imports: [NgDiagramPortComponent],
  template: `
    <div
      class="dsn-node"
      [class.dsn-node--fuera]="nodeData().frontera === 'fuera'"
      [style.background]="nodeData().bg"
      [style.border-color]="nodeData().border"
    >
      <ng-diagram-port id="left" type="both" side="left" />

      <div class="dsn-node__content">
        <i class="pi {{ nodeData().icon }}" [style.color]="nodeData().color"></i>
        <span class="dsn-node__label" [style.color]="nodeData().color">
          {{ nodeData().label }}
        </span>
      </div>

      <ng-diagram-port id="right" type="both" side="right" />
    </div>
  `,
  styles: [`
    .dsn-node {
      border: 2px solid;
      border-radius: 10px;
      padding: 10px 14px;
      min-width: 130px;
      max-width: 170px;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
      position: relative;
    }

    .dsn-node--fuera {
      border-style: dashed;
      opacity: 0.85;
    }

    .dsn-node__content {
      display: flex;
      align-items: center;
      gap: 7px;
      flex: 1;
      min-width: 0;
    }

    .dsn-node__label {
      font-size: 0.78rem;
      font-weight: 600;
      line-height: 1.3;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .pi {
      font-size: 0.85rem;
      flex-shrink: 0;
    }
  `],
})
export class DiagramaSistemaNodoComponent implements NgDiagramNodeTemplate<SistemaNodoData> {
  node = input.required<SimpleNode<SistemaNodoData>>();
  nodeData = computed(() => this.node().data);
}
