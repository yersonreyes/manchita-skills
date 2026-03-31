import { Component, computed, input } from '@angular/core';
import { NgDiagramNodeTemplate, NgDiagramPortComponent, SimpleNode } from 'ng-diagram';

export interface InOutNodeData {
  label: string;
  nodeType: 'input' | 'process' | 'output';
  color: string;
  bg: string;
  border: string;
  icon: string;
}

@Component({
  selector: 'app-in-out-node',
  standalone: true,
  imports: [NgDiagramPortComponent],
  template: `
    <div
      class="ion-node"
      [class.ion-node--process]="nodeData().nodeType === 'process'"
      [style.background]="nodeData().bg"
      [style.border-color]="nodeData().border"
    >
      @if (nodeData().nodeType !== 'process') {
        <ng-diagram-port id="left" type="both" side="left" />
      }

      <div class="ion-node__content">
        <i class="pi {{ nodeData().icon }}" [style.color]="nodeData().color"></i>
        <span class="ion-node__label" [style.color]="nodeData().nodeType === 'process' ? '#1e293b' : nodeData().color">
          {{ nodeData().label }}
        </span>
      </div>

      @if (nodeData().nodeType !== 'process') {
        <ng-diagram-port id="right" type="both" side="right" />
      }
      @if (nodeData().nodeType === 'process') {
        <ng-diagram-port id="left" type="both" side="left" />
        <ng-diagram-port id="right" type="both" side="right" />
      }
    </div>
  `,
  styles: [`
    .ion-node {
      border: 2px solid;
      border-radius: 10px;
      padding: 10px 14px;
      min-width: 140px;
      max-width: 180px;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
      position: relative;
    }

    .ion-node--process {
      min-width: 160px;
      max-width: 200px;
      border-color: #94a3b8;
      background: #f8fafc;
      justify-content: center;
      flex-direction: column;
      text-align: center;
      gap: 4px;
      padding: 14px 16px;
      border-style: dashed;
    }

    .ion-node__content {
      display: flex;
      align-items: center;
      gap: 7px;
      flex: 1;
      min-width: 0;
    }

    .ion-node--process .ion-node__content {
      flex-direction: column;
      gap: 4px;
    }

    .ion-node__label {
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
export class InOutNodeComponent implements NgDiagramNodeTemplate<InOutNodeData> {
  node = input.required<SimpleNode<InOutNodeData>>();
  nodeData = computed(() => this.node().data);
}
